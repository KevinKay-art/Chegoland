import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import type {
  ContactMessage,
  Cow,
  DailyChartPoint,
  FarmOverviewStats,
  Language,
  MilkRecord,
  Order,
  OrderStatus,
  Product,
} from './src/types/index.ts';
import { loadDatabase, saveDatabase } from './server/store.ts';
import {
  applyDarajaCallback,
  forceStkOutcome,
  initiateStkPush,
  queryStkStatus,
} from './server/mpesa.ts';
import {
  generateFarmInsights,
  generateShopAssistantReply,
  type ChatTurn,
} from './server/gemini.ts';

const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'chegoland2026';

// In-memory admin session tokens (survive requests while server runs)
const validAdminTokens = new Set<string>();

function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(?:\+254|254|0)(?:7|1)\d{8}$/.test(cleaned);
}

function normalizePhoneCompare(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+254')) return `0${cleaned.slice(4)}`;
  if (cleaned.startsWith('254')) return `0${cleaned.slice(3)}`;
  return cleaned;
}

function computeOverviewStats(): FarmOverviewStats {
  const db = loadDatabase();
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayMilkLitres = db.milkRecords
    .filter((r) => r.date === todayStr)
    .reduce((sum, r) => sum + r.totalLitres, 0);

  const todaySalesKes = db.orders
    .filter((o) => o.createdAt.slice(0, 10) === todayStr && o.paymentStatus !== 'Failed')
    .reduce((sum, o) => sum + o.totalKes, 0);

  const pendingOrdersCount = db.orders.filter(
    (o) => o.status !== 'Delivered' && o.paymentStatus !== 'Failed'
  ).length;

  const lactatingCowsCount = db.cows.filter((c) => c.status === 'Lactating').length;
  const unreadMessagesCount = db.messages.filter((m) => !m.read).length;

  // Build 30-day series
  const chart30Days: DailyChartPoint[] = [];
  for (let daysAgo = 29; daysAgo >= 0; daysAgo--) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateKey = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });

    const milkLitres = Number(
      db.milkRecords
        .filter((r) => r.date === dateKey)
        .reduce((s, r) => s + r.totalLitres, 0)
        .toFixed(1)
    );

    const salesKes = db.orders
      .filter((o) => o.createdAt.slice(0, 10) === dateKey && o.paymentStatus !== 'Failed')
      .reduce((s, o) => s + o.totalKes, 0);

    chart30Days.push({
      date: dateKey,
      label,
      milkLitres,
      salesKes,
    });
  }

  return {
    todayMilkLitres: Number(todayMilkLitres.toFixed(1)),
    todaySalesKes,
    pendingOrdersCount,
    lactatingCowsCount,
    totalCowsCount: db.cows.length,
    unreadMessagesCount,
    chart30Days,
  };
}

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !validAdminTokens.has(token)) {
    res.status(401).json({ error: 'Unauthorized. Please log in as farm admin.' });
    return;
  }
  next();
}

async function startServer(): Promise<void> {
  // Initialize database on startup
  loadDatabase();

  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // ---------- PUBLIC REST API ----------

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'chegoland-api' });
  });

  app.get('/api/products', (_req, res) => {
    const db = loadDatabase();
    res.json(db.products);
  });

  app.get('/api/cows', (_req, res) => {
    const db = loadDatabase();
    res.json(db.cows);
  });

  // Track Order (requires matching order number and phone number)
  app.get('/api/orders/track', (req, res) => {
    const orderNumber = String(req.query.orderNumber || '').trim().toUpperCase();
    const phone = String(req.query.phone || '').trim();

    if (!orderNumber || !phone) {
      res.status(400).json({ error: 'Order number and phone number are required.' });
      return;
    }

    const db = loadDatabase();
    const normInputPhone = normalizePhoneCompare(phone);
    const match = db.orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === orderNumber &&
        normalizePhoneCompare(o.phone) === normInputPhone
    );

    if (!match) {
      res.status(404).json({
        error: 'No matching order found. Please check your order number and phone number.',
      });
      return;
    }

    res.json(match);
  });

  // Fetch single order summary (used by confirmation page)
  app.get('/api/orders/:orderNumber', (req, res) => {
    const orderNumber = String(req.params.orderNumber || '').trim().toUpperCase();
    const db = loadDatabase();
    const order = db.orders.find((o) => o.orderNumber.toUpperCase() === orderNumber);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json(order);
  });

  // Place new order (validates Kenyan phone, validates & deducts stock, optionally initiates M-Pesa STK Push)
  app.post('/api/orders', async (req, res) => {
    const {
      customerName,
      phone,
      deliveryArea,
      deliveryNotes,
      items,
      paymentMethod,
    } = req.body as {
      customerName?: string;
      phone?: string;
      deliveryArea?: string;
      deliveryNotes?: string;
      items?: Array<{ productId: string; quantity: number }>;
      paymentMethod?: 'M-Pesa' | 'Cash on Delivery';
    };

    if (!customerName || customerName.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your full name.' });
      return;
    }
    if (!phone || !isValidKenyanPhone(phone)) {
      res.status(400).json({
        error: 'Please enter a valid Kenyan phone number (e.g. 0712 345 678 or +254712345678).',
      });
      return;
    }
    if (!deliveryArea || deliveryArea.trim().length < 2) {
      res.status(400).json({ error: 'Please select or enter your delivery area.' });
      return;
    }
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Your cart is empty.' });
      return;
    }
    if (paymentMethod !== 'M-Pesa' && paymentMethod !== 'Cash on Delivery') {
      res.status(400).json({ error: 'Invalid payment method.' });
      return;
    }

    const db = loadDatabase();
    const resolvedItems: Order['items'] = [];

    for (const reqItem of items) {
      const qty = Math.floor(Number(reqItem.quantity));
      if (!reqItem.productId || !Number.isFinite(qty) || qty < 1) {
        res.status(400).json({ error: 'Invalid cart item quantity.' });
        return;
      }
      const product = db.products.find((p) => p.id === reqItem.productId);
      if (!product) {
        res.status(404).json({ error: 'One of the selected products no longer exists.' });
        return;
      }
      if (qty > product.stock) {
        res.status(409).json({
          error: `Only ${product.stock} left in stock for ${product.name} (${product.unit}).`,
        });
        return;
      }
      resolvedItems.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        priceKes: product.priceKes,
        quantity: qty,
      });
    }

    // Deduct stock atomically
    for (const item of resolvedItems) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    }

    const subtotalKes = resolvedItems.reduce((sum, i) => sum + i.priceKes * i.quantity, 0);
    const deliveryFeeKes = subtotalKes >= 2000 ? 0 : 150;
    const totalKes = subtotalKes + deliveryFeeKes;

    const nextSeq = 1004 + db.orders.length;
    const orderNumber = `CHG-2026-${nextSeq}`;
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: customerName.trim(),
      phone: normalizePhoneCompare(phone),
      deliveryArea: deliveryArea.trim(),
      deliveryNotes: (deliveryNotes || '').trim(),
      items: resolvedItems,
      subtotalKes,
      deliveryFeeKes,
      totalKes,
      paymentMethod,
      paymentStatus: 'Pending',
      status: 'Received',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    db.orders.unshift(newOrder);
    saveDatabase(db);

    if (paymentMethod === 'M-Pesa') {
      try {
        const stkSession = await initiateStkPush({
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          phone: newOrder.phone,
          amountKes: newOrder.totalKes,
        });
        res.status(201).json({
          order: newOrder,
          mpesa: {
            checkoutRequestId: stkSession.checkoutRequestId,
            merchantRequestId: stkSession.merchantRequestId,
            customerMessage: `STK Push sent to ${newOrder.phone}. Enter your M-Pesa PIN to pay KES ${newOrder.totalKes.toLocaleString('en-KE')}.`,
          },
        });
        return;
      } catch (err) {
        // Restore stock & mark failed if Daraja rejects STK Push
        newOrder.paymentStatus = 'Failed';
        for (const item of newOrder.items) {
          const product = db.products.find((p) => p.id === item.productId);
          if (product) product.stock += item.quantity;
        }
        saveDatabase(db);
        res.status(502).json({
          error: err instanceof Error ? err.message : 'Failed to initiate M-Pesa STK Push.',
        });
        return;
      }
    }

    res.status(201).json({ order: newOrder });
  });

  // Poll M-Pesa STK Push Status
  app.get('/api/payments/mpesa/status/:checkoutRequestId', async (req, res) => {
    const session = await queryStkStatus(req.params.checkoutRequestId);
    if (!session) {
      res.status(404).json({ error: 'M-Pesa payment session not found.' });
      return;
    }

    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === session.orderId);

    if (order && session.status === 'SUCCESS' && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      order.mpesaReceipt = session.mpesaReceipt;
      order.updatedAt = new Date().toISOString();
      saveDatabase(db);
    } else if (order && session.status === 'FAILED' && order.paymentStatus !== 'Failed') {
      order.paymentStatus = 'Failed';
      order.updatedAt = new Date().toISOString();
      // Restore reserved stock when M-Pesa fails
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock += item.quantity;
        }
      }
      saveDatabase(db);
    }

    res.json({
      checkoutRequestId: session.checkoutRequestId,
      status: session.status,
      resultDesc: session.resultDesc,
      mpesaReceipt: session.mpesaReceipt,
      orderNumber: session.orderNumber,
    });
  });

  // Safaricom Daraja STK Push Callback Webhook
  app.post('/api/payments/mpesa/callback', (req, res) => {
    const session = applyDarajaCallback(req.body);
    if (session) {
      const db = loadDatabase();
      const order = db.orders.find((o) => o.id === session.orderId);
      if (order && session.status === 'SUCCESS' && order.paymentStatus !== 'Paid') {
        order.paymentStatus = 'Paid';
        order.mpesaReceipt = session.mpesaReceipt;
        order.updatedAt = new Date().toISOString();
        saveDatabase(db);
      } else if (order && session.status === 'FAILED' && order.paymentStatus !== 'Failed') {
        order.paymentStatus = 'Failed';
        order.updatedAt = new Date().toISOString();
        for (const item of order.items) {
          const product = db.products.find((p) => p.id === item.productId);
          if (product) product.stock += item.quantity;
        }
        saveDatabase(db);
      }
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  });

  // Allow simulation test trigger (to test failure or immediate success in sandbox)
  app.post('/api/payments/mpesa/simulate', async (req, res) => {
    const { checkoutRequestId, outcome } = req.body as {
      checkoutRequestId?: string;
      outcome?: 'success' | 'failed';
    };
    if (!checkoutRequestId || (outcome !== 'success' && outcome !== 'failed')) {
      res.status(400).json({ error: 'checkoutRequestId and outcome (success|failed) required.' });
      return;
    }
    const session = await forceStkOutcome(checkoutRequestId, outcome);
    if (!session) {
      res.status(404).json({ error: 'Payment session not found.' });
      return;
    }

    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === session.orderId);
    if (order && session.status === 'SUCCESS' && order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      order.mpesaReceipt = session.mpesaReceipt;
      order.updatedAt = new Date().toISOString();
      saveDatabase(db);
    } else if (order && session.status === 'FAILED' && order.paymentStatus !== 'Failed') {
      order.paymentStatus = 'Failed';
      order.updatedAt = new Date().toISOString();
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock += item.quantity;
      }
      saveDatabase(db);
    }

    res.json({
      checkoutRequestId: session.checkoutRequestId,
      status: session.status,
      resultDesc: session.resultDesc,
      mpesaReceipt: session.mpesaReceipt,
      orderNumber: session.orderNumber,
    });
  });

  // Retry M-Pesa payment on an existing failed order (re-reserves stock)
  app.post('/api/payments/mpesa/retry', async (req, res) => {
    const { orderNumber, phone } = req.body as { orderNumber?: string; phone?: string };
    const db = loadDatabase();
    const order = db.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    if (order.paymentStatus === 'Paid') {
      res.status(400).json({ error: 'Order is already paid.' });
      return;
    }

    // Re-check & deduct stock if previously restored on failure
    if (order.paymentStatus === 'Failed') {
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
          res.status(409).json({
            error: `Insufficient stock to retry ${item.name}. Please update your cart.`,
          });
          return;
        }
      }
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock -= item.quantity;
      }
    }

    const payPhone = phone && isValidKenyanPhone(phone) ? normalizePhoneCompare(phone) : order.phone;
    order.phone = payPhone;
    order.paymentStatus = 'Pending';
    order.updatedAt = new Date().toISOString();
    saveDatabase(db);

    try {
      const stkSession = await initiateStkPush({
        orderId: order.id,
        orderNumber: order.orderNumber,
        phone: payPhone,
        amountKes: order.totalKes,
        simulateOutcome: 'success',
      });

      res.json({
        order,
        mpesa: {
          checkoutRequestId: stkSession.checkoutRequestId,
          merchantRequestId: stkSession.merchantRequestId,
          customerMessage: `STK Push re-sent to ${payPhone}.`,
        },
      });
    } catch (err) {
      order.paymentStatus = 'Failed';
      for (const item of order.items) {
        const product = db.products.find((p) => p.id === item.productId);
        if (product) product.stock += item.quantity;
      }
      saveDatabase(db);
      res.status(502).json({
        error: err instanceof Error ? err.message : 'Failed to re-send M-Pesa STK Push.',
      });
    }
  });

  // Contact form submission
  app.post('/api/messages', (req, res) => {
    const { name, phone, email, subject, message } = req.body as {
      name?: string;
      phone?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter your name.' });
      return;
    }
    if (!phone || !isValidKenyanPhone(phone)) {
      res.status(400).json({ error: 'Please enter a valid Kenyan phone number.' });
      return;
    }
    if (!message || message.trim().length < 5) {
      res.status(400).json({ error: 'Please write a short message.' });
      return;
    }

    const db = loadDatabase();
    const newMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      phone: normalizePhoneCompare(phone),
      email: (email || '').trim(),
      subject: (subject || 'General Inquiry').trim(),
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.messages.unshift(newMsg);
    saveDatabase(db);
    res.status(201).json(newMsg);
  });

  // Gemini "Ask Chegoland" Public Chat Assistant
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history, language } = req.body as {
        message?: string;
        history?: ChatTurn[];
        language?: Language;
      };

      if (!message || !message.trim()) {
        res.status(400).json({ error: 'Message cannot be empty.' });
        return;
      }

      const db = loadDatabase();
      const reply = await generateShopAssistantReply({
        message: message.trim(),
        history: Array.isArray(history) ? history : [],
        language: language === 'sw' ? 'sw' : 'en',
        products: db.products,
        cows: db.cows,
      });

      res.json({ reply });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Chegoland Assistant.';
      res.status(500).json({ error: msg });
    }
  });

  // ---------- ADMIN AUTH & PROTECTED API ----------

  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Incorrect admin password.' });
      return;
    }
    const token = crypto.randomBytes(32).toString('hex');
    validAdminTokens.add(token);
    res.json({ token });
  });

  app.post('/api/admin/logout', requireAdmin, (req, res) => {
    const token = (req.headers.authorization || '').slice(7).trim();
    validAdminTokens.delete(token);
    res.json({ ok: true });
  });

  app.get('/api/admin/verify', requireAdmin, (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/admin/overview', requireAdmin, (_req, res) => {
    res.json(computeOverviewStats());
  });

  // Admin AI Farm Insights
  app.post('/api/admin/ai-insights', requireAdmin, async (_req, res) => {
    try {
      const db = loadDatabase();
      const stats = computeOverviewStats();
      const insights = await generateFarmInsights({
        stats,
        products: db.products,
        cows: db.cows,
      });
      res.json(insights);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate farm insights.';
      res.status(500).json({ error: msg });
    }
  });

  // Admin Cows CRUD
  app.post('/api/admin/cows', requireAdmin, (req, res) => {
    const { name, tagNumber, breed, ageYears, status, dailyLitresAvg, photo, bio } =
      req.body as Partial<Cow>;

    if (!name || !tagNumber || !breed) {
      res.status(400).json({ error: 'Cow name, tag number, and breed are required.' });
      return;
    }

    const db = loadDatabase();
    const cow: Cow = {
      id: `cow-${Date.now()}`,
      name: name.trim(),
      tagNumber: tagNumber.trim().toUpperCase(),
      breed,
      ageYears: Math.max(1, Number(ageYears || 3)),
      status: status || 'Lactating',
      dailyLitresAvg: Math.max(0, Number(dailyLitresAvg || 0)),
      photo: photo?.trim() || '/src/assets/images/cow_friesian_zerograzed_1794821932972.jpg',
      bio: (bio || '').trim(),
    };

    db.cows.push(cow);
    saveDatabase(db);
    res.status(201).json(cow);
  });

  app.put('/api/admin/cows/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const idx = db.cows.findIndex((c) => c.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Cow not found.' });
      return;
    }
    const existing = db.cows[idx];
    const body = req.body as Partial<Cow>;
    db.cows[idx] = {
      ...existing,
      ...body,
      id: existing.id,
      name: (body.name ?? existing.name).trim(),
      tagNumber: (body.tagNumber ?? existing.tagNumber).trim().toUpperCase(),
      ageYears: Math.max(0, Number(body.ageYears ?? existing.ageYears)),
      dailyLitresAvg: Math.max(0, Number(body.dailyLitresAvg ?? existing.dailyLitresAvg)),
    };
    saveDatabase(db);
    res.json(db.cows[idx]);
  });

  app.delete('/api/admin/cows/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const before = db.cows.length;
    db.cows = db.cows.filter((c) => c.id !== req.params.id);
    if (db.cows.length === before) {
      res.status(404).json({ error: 'Cow not found.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin Milk Records CRUD
  app.get('/api/admin/milk-records', requireAdmin, (_req, res) => {
    const db = loadDatabase();
    const sorted = [...db.milkRecords].sort((a, b) => b.date.localeCompare(a.date));
    res.json(sorted);
  });

  app.post('/api/admin/milk-records', requireAdmin, (req, res) => {
    const { cowId, date, morningLitres, eveningLitres, notes } = req.body as {
      cowId?: string;
      date?: string;
      morningLitres?: number;
      eveningLitres?: number;
      notes?: string;
    };

    const db = loadDatabase();
    const cow = db.cows.find((c) => c.id === cowId);
    if (!cow) {
      res.status(404).json({ error: 'Selected cow not found.' });
      return;
    }

    const m = Math.max(0, Number(morningLitres || 0));
    const e = Math.max(0, Number(eveningLitres || 0));
    if (m + e <= 0) {
      res.status(400).json({ error: 'Total litres must be greater than 0.' });
      return;
    }

    const recordDate = date || new Date().toISOString().slice(0, 10);
    const totalLitres = Number((m + e).toFixed(1));

    // Update if same cow + date already exists, otherwise insert
    const existingIdx = db.milkRecords.findIndex(
      (r) => r.cowId === cow.id && r.date === recordDate
    );

    const record: MilkRecord = {
      id: existingIdx >= 0 ? db.milkRecords[existingIdx].id : `mr-${Date.now()}`,
      cowId: cow.id,
      cowName: cow.name,
      date: recordDate,
      morningLitres: Number(m.toFixed(1)),
      eveningLitres: Number(e.toFixed(1)),
      totalLitres,
      notes: (notes || '').trim() || undefined,
    };

    if (existingIdx >= 0) {
      db.milkRecords[existingIdx] = record;
    } else {
      db.milkRecords.unshift(record);
    }

    // Recalculate cow's recent average
    const cowRecords = db.milkRecords.filter((r) => r.cowId === cow.id).slice(0, 14);
    if (cowRecords.length > 0) {
      cow.dailyLitresAvg = Number(
        (cowRecords.reduce((s, r) => s + r.totalLitres, 0) / cowRecords.length).toFixed(1)
      );
    }

    saveDatabase(db);
    res.status(201).json(record);
  });

  app.delete('/api/admin/milk-records/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const before = db.milkRecords.length;
    db.milkRecords = db.milkRecords.filter((r) => r.id !== req.params.id);
    if (db.milkRecords.length === before) {
      res.status(404).json({ error: 'Milk record not found.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin Products CRUD
  app.post('/api/admin/products', requireAdmin, (req, res) => {
    const body = req.body as Partial<Product>;
    if (!body.name || !body.unit || !body.category || !Number.isFinite(Number(body.priceKes))) {
      res.status(400).json({ error: 'Name, category, unit, and price are required.' });
      return;
    }

    const db = loadDatabase();
    const product: Product = {
      id: `prod-${Date.now()}`,
      name: body.name.trim(),
      nameSw: (body.nameSw || body.name).trim(),
      category: body.category,
      unit: body.unit.trim(),
      priceKes: Math.max(1, Math.round(Number(body.priceKes))),
      stock: Math.max(0, Math.floor(Number(body.stock ?? 0))),
      lowStockThreshold: Math.max(1, Math.floor(Number(body.lowStockThreshold ?? 8))),
      description: (body.description || 'Fresh Chegoland dairy farm product.').trim(),
      descriptionSw: (body.descriptionSw || body.description || 'Bidhaa safi ya shamba la Chegoland.').trim(),
      image: body.image?.trim() || '/src/assets/images/product_fresh_milk_1794817659179.jpg',
      featured: Boolean(body.featured),
      nutritionHighlight: (body.nutritionHighlight || '100% pure farm dairy').trim(),
    };

    db.products.push(product);
    saveDatabase(db);
    res.status(201).json(product);
  });

  app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const idx = db.products.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    const existing = db.products[idx];
    const body = req.body as Partial<Product>;
    db.products[idx] = {
      ...existing,
      ...body,
      id: existing.id,
      priceKes: Math.max(1, Math.round(Number(body.priceKes ?? existing.priceKes))),
      stock: Math.max(0, Math.floor(Number(body.stock ?? existing.stock))),
      lowStockThreshold: Math.max(
        1,
        Math.floor(Number(body.lowStockThreshold ?? existing.lowStockThreshold))
      ),
    };
    saveDatabase(db);
    res.json(db.products[idx]);
  });

  app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const before = db.products.length;
    db.products = db.products.filter((p) => p.id !== req.params.id);
    if (db.products.length === before) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    saveDatabase(db);
    res.json({ ok: true });
  });

  // Admin Orders
  app.get('/api/admin/orders', requireAdmin, (_req, res) => {
    const db = loadDatabase();
    const sorted = [...db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(sorted);
  });

  app.patch('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
    const { status } = req.body as { status?: OrderStatus };
    const allowed: OrderStatus[] = ['Received', 'Preparing', 'Out for Delivery', 'Delivered'];
    if (!status || !allowed.includes(status)) {
      res.status(400).json({ error: 'Invalid order status.' });
      return;
    }

    const db = loadDatabase();
    const order = db.orders.find((o) => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    order.status = status;
    if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }
    order.updatedAt = new Date().toISOString();
    saveDatabase(db);
    res.json(order);
  });

  // Admin Contact Messages
  app.get('/api/admin/messages', requireAdmin, (_req, res) => {
    const db = loadDatabase();
    const sorted = [...db.messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    res.json(sorted);
  });

  app.patch('/api/admin/messages/:id/read', requireAdmin, (req, res) => {
    const db = loadDatabase();
    const msg = db.messages.find((m) => m.id === req.params.id);
    if (!msg) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    const { read } = req.body as { read?: boolean };
    msg.read = typeof read === 'boolean' ? read : !msg.read;
    saveDatabase(db);
    res.json(msg);
  });

  // ---------- VITE DEV MIDDLEWARE / STATIC PROD SERVING ----------

  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve('dist/index.html'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve('dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chegoland server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Chegoland server:', err);
  process.exit(1);
});
