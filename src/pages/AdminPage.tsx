import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart3,
  Check,
  Droplets,
  Lock,
  LogOut,
  Mail,
  Milk,
  Package,
  Plus,
  Printer,
  ShoppingBag,
  Sparkles,
  Trash2,
  Edit3,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { DeliveryNoteModal } from '../components/admin/DeliveryNoteModal.tsx';
import { ProductionSalesChart } from '../components/admin/ProductionSalesChart.tsx';
import { FarmImage } from '../components/FarmImage.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import type {
  ContactMessage,
  Cow,
  CowBreed,
  CowStatus,
  FarmInsightsResponse,
  FarmOverviewStats,
  MilkRecord,
  Order,
  OrderStatus,
  Product,
  ProductCategory,
} from '../types/index.ts';
import { formatDateTime, formatKes, formatShortDate } from '../utils/format.ts';

type AdminTab = 'overview' | 'cows' | 'milk' | 'products' | 'orders' | 'messages';

const TOKEN_STORAGE_KEY = 'chegoland_admin_token_v1';

const COW_PHOTO_PRESETS = [
  {
    label: 'Friesian (Zero-Grazed)',
    url: '/src/assets/images/cow_friesian_zerograzed_1794821932972.jpg',
  },
  {
    label: 'Ayrshire (Zero-Grazed)',
    url: '/src/assets/images/cow_ayrshire_zerograzed_1794821933642.jpg',
  },
  {
    label: 'Jersey (Zero-Grazed)',
    url: '/src/assets/images/cow_jersey_zerograzed_1794821935243.jpg',
  },
];

const PRODUCT_PHOTO_PRESETS = [
  {
    label: 'Fresh Milk Bottles',
    url: '/src/assets/images/product_fresh_milk_1794817659179.jpg',
  },
  {
    label: 'Kenyan Traditional Mala',
    url: '/src/assets/images/product_kenyan_mala_1794821934885.jpg',
  },
  {
    label: 'Natural Yoghurt',
    url: '/src/assets/images/product_mala_yoghurt_1794817659247.jpg',
  },
  {
    label: 'Ghee & Butter',
    url: '/src/assets/images/product_ghee_butter_1794817659885.jpg',
  },
  {
    label: 'Farm Eggs Tray',
    url: '/src/assets/images/product_farm_eggs_1794817660006.jpg',
  },
];

export function AdminPage() {
  const { refreshProducts } = useAppContext();

  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [verifying, setVerifying] = useState<boolean>(Boolean(sessionStorage.getItem(TOKEN_STORAGE_KEY)));
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [overview, setOverview] = useState<FarmOverviewStats | null>(null);
  const [cows, setCows] = useState<Cow[]>([]);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Gemini AI Insights
  const [insights, setInsights] = useState<FarmInsightsResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Cow form state
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [cowModalOpen, setCowModalOpen] = useState(false);
  const [cowForm, setCowForm] = useState<{
    name: string;
    tagNumber: string;
    breed: CowBreed;
    ageYears: number;
    status: CowStatus;
    dailyLitresAvg: number;
    photo: string;
    bio: string;
  }>({
    name: '',
    tagNumber: '',
    breed: 'Friesian',
    ageYears: 4,
    status: 'Lactating',
    dailyLitresAvg: 22,
    photo: COW_PHOTO_PRESETS[0].url,
    bio: '',
  });

  // Milk record form state
  const [milkForm, setMilkForm] = useState({
    cowId: '',
    date: new Date().toISOString().slice(0, 10),
    morningLitres: '14.0',
    eveningLitres: '11.5',
    notes: '',
  });
  const [milkSubmitting, setMilkSubmitting] = useState(false);
  const [milkFilterCow, setMilkFilterCow] = useState('all');

  // Product form state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<{
    name: string;
    nameSw: string;
    category: ProductCategory;
    unit: string;
    priceKes: number;
    stock: number;
    lowStockThreshold: number;
    description: string;
    descriptionSw: string;
    image: string;
    featured: boolean;
    nutritionHighlight: string;
  }>({
    name: '',
    nameSw: '',
    category: 'Milk',
    unit: '1L',
    priceKes: 120,
    stock: 20,
    lowStockThreshold: 8,
    description: '',
    descriptionSw: '',
    image: PRODUCT_PHOTO_PRESETS[0].url,
    featured: false,
    nutritionHighlight: '',
  });

  // Orders filter & print modal
  const [orderStatusFilter, setOrderStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrderNote, setSelectedOrderNote] = useState<Order | null>(null);

  const loadAllAdminData = useCallback(
    async (authToken: string) => {
      setLoadingData(true);
      setDataError(null);
      try {
        const [ov, cw, mr, pr, ord, msg] = await Promise.all([
          api.adminGetOverview(authToken),
          api.getCows(),
          api.adminGetMilkRecords(authToken),
          api.getProducts(),
          api.adminGetOrders(authToken),
          api.adminGetMessages(authToken),
        ]);
        setOverview(ov);
        setCows(cw);
        setMilkRecords(mr);
        setProducts(pr);
        setOrders(ord);
        setMessages(msg);
        if (cw.length > 0) {
          setMilkForm((prev) => ({ ...prev, cowId: prev.cowId || cw[0].id }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data.';
        if (message.toLowerCase().includes('unauthorized')) {
          sessionStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken('');
        } else {
          setDataError(message);
        }
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  // Verify existing session token on mount
  useEffect(() => {
    if (!token) {
      setVerifying(false);
      return;
    }
    api
      .adminVerify(token)
      .then(() => {
        setVerifying(false);
        void loadAllAdminData(token);
      })
      .catch(() => {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        setVerifying(false);
      });
  }, [token, loadAllAdminData]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    if (!password.trim()) {
      setLoginError('Please enter the farm admin password.');
      return;
    }
    setLoggingIn(true);
    try {
      const res = await api.adminLogin(password);
      sessionStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      setToken(res.token);
      setPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Invalid password.');
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    if (token) {
      try {
        await api.adminLogout(token);
      } catch {
        // ignore
      }
    }
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
  }

  async function handleGenerateInsights() {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await api.adminGetInsights(token);
      setInsights(res);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : 'Could not generate AI insights.');
    } finally {
      setInsightsLoading(false);
    }
  }

  function openNewCowModal() {
    setEditingCow(null);
    setCowForm({
      name: '',
      tagNumber: `CHG-0${cows.length + 45}`,
      breed: 'Friesian',
      ageYears: 3,
      status: 'Lactating',
      dailyLitresAvg: 22,
      photo: COW_PHOTO_PRESETS[0].url,
      bio: '',
    });
    setCowModalOpen(true);
  }

  function openEditCowModal(cow: Cow) {
    setEditingCow(cow);
    setCowForm({
      name: cow.name,
      tagNumber: cow.tagNumber,
      breed: cow.breed,
      ageYears: cow.ageYears,
      status: cow.status,
      dailyLitresAvg: cow.dailyLitresAvg,
      photo: cow.photo,
      bio: cow.bio,
    });
    setCowModalOpen(true);
  }

  async function handleSaveCow(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingCow) {
        await api.adminUpdateCow(token, editingCow.id, cowForm);
      } else {
        await api.adminAddCow(token, cowForm);
      }
      setCowModalOpen(false);
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to save cow.');
    }
  }

  async function handleDeleteCow(id: string) {
    try {
      await api.adminDeleteCow(token, id);
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to delete cow.');
    }
  }

  async function handleAddMilkRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!milkForm.cowId) return;
    setMilkSubmitting(true);
    setDataError(null);
    try {
      await api.adminAddMilkRecord(token, {
        cowId: milkForm.cowId,
        date: milkForm.date,
        morningLitres: Number(milkForm.morningLitres),
        eveningLitres: Number(milkForm.eveningLitres),
        notes: milkForm.notes,
      });
      setMilkForm((prev) => ({ ...prev, notes: '' }));
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to log milk record.');
    } finally {
      setMilkSubmitting(false);
    }
  }

  async function handleDeleteMilkRecord(id: string) {
    try {
      await api.adminDeleteMilkRecord(token, id);
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to delete milk record.');
    }
  }

  function openNewProductModal() {
    setEditingProduct(null);
    setProductForm({
      name: '',
      nameSw: '',
      category: 'Milk',
      unit: '1L',
      priceKes: 120,
      stock: 25,
      lowStockThreshold: 8,
      description: '',
      descriptionSw: '',
      image: PRODUCT_PHOTO_PRESETS[0].url,
      featured: false,
      nutritionHighlight: '100% pure zero-grazed highland dairy',
    });
    setProductModalOpen(true);
  }

  function openEditProductModal(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      nameSw: product.nameSw,
      category: product.category,
      unit: product.unit,
      priceKes: product.priceKes,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      description: product.description,
      descriptionSw: product.descriptionSw,
      image: product.image,
      featured: product.featured,
      nutritionHighlight: product.nutritionHighlight,
    });
    setProductModalOpen(true);
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.adminUpdateProduct(token, editingProduct.id, productForm);
      } else {
        await api.adminAddProduct(token, productForm);
      }
      setProductModalOpen(false);
      await Promise.all([loadAllAdminData(token), refreshProducts()]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to save product.');
    }
  }

  async function handleQuickProductAdjust(product: Product, field: 'stock' | 'priceKes', value: number) {
    try {
      await api.adminUpdateProduct(token, product.id, { [field]: Math.max(0, value) });
      await Promise.all([loadAllAdminData(token), refreshProducts()]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to update product.');
    }
  }

  async function handleDeleteProduct(id: string) {
    try {
      await api.adminDeleteProduct(token, id);
      await Promise.all([loadAllAdminData(token), refreshProducts()]);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to delete product.');
    }
  }

  async function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    try {
      await api.adminUpdateOrderStatus(token, orderId, status);
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to update order status.');
    }
  }

  async function handleToggleMessageRead(msg: ContactMessage) {
    try {
      await api.adminToggleMessageRead(token, msg.id, !msg.read);
      await loadAllAdminData(token);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to update message.');
    }
  }

  if (verifying) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-[#6D5649]">
        Verifying admin session...
      </div>
    );
  }

  // Login screen
  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-white rounded-2xl border border-[#E6DEC8] p-8 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-5">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2C1E16]">
            CHEGOLAND Agri-Empire LTD
          </h1>
          <p className="text-xs font-medium text-[#2E7D32] mt-0.5">
            Dairy Farm and Shop · Admin Console
          </p>
          <p className="mt-1.5 text-sm text-[#5D4B41]">
            Sign in with your farm administrator password to manage herd records, daily milk
            yields, products, and customer orders.
          </p>

          <form onSubmit={(e) => void handleLogin(e)} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-[#3E2723] mb-1.5"
              >
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
              />
              <p className="mt-1.5 text-xs text-[#6D5649]">
                Default preview password: <span className="font-mono">chegoland2026</span> (configurable via <span className="font-mono">ADMIN_PASSWORD</span>)
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#B91C1C]">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {loggingIn ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const navTabs: Array<{ id: AdminTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'cows', label: 'Cows', icon: <Milk className="w-4 h-4" /> },
    { id: 'milk', label: 'Milk Records', icon: <Droplets className="w-4 h-4" /> },
    { id: 'products', label: 'Products', icon: <Package className="w-4 h-4" /> },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: overview?.pendingOrdersCount,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <Mail className="w-4 h-4" />,
      badge: overview?.unreadMessagesCount,
    },
  ];

  const todayDate = new Date().toISOString().slice(0, 10);
  const todayRecords = milkRecords.filter((r) => r.date === todayDate);
  const filteredMilkRecords =
    milkFilterCow === 'all'
      ? milkRecords
      : milkRecords.filter((r) => r.cowId === milkFilterCow);

  const filteredOrders =
    orderStatusFilter === 'All'
      ? orders
      : orders.filter((o) => o.status === orderStatusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DEC8]">
        <div>
          <p className="text-xs text-[#6D5649]">
            CHEGOLAND Agri-Empire LTD Dairy Farm and Shop /{' '}
            {navTabs.find((t) => t.id === activeTab)?.label}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1E16] mt-0.5">
            Farm Management Console
          </h1>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D8CEB8] bg-white hover:bg-[#F5EFE0] text-sm font-medium text-[#3E2723] self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </button>
      </div>

      {dataError && (
        <div className="mt-4 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
          {dataError}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-[#E6DEC8] p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {navTabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#2E7D32] text-white'
                    : 'text-[#4E3B31] hover:bg-[#FAF4E4]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-[#FAF4E4] text-[#2C1E16]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Viewport */}
        <div className="lg:col-span-9 space-y-6">
          {loadingData && !overview ? (
            <div className="h-80 rounded-xl bg-white border border-[#E6DEC8] animate-pulse" />
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && overview && (
                <div className="space-y-6">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-[#E6DEC8] p-5">
                      <span className="text-xs font-medium text-[#6D5649]">
                        Today’s Milk Collected
                      </span>
                      <div className="mt-2 font-mono text-2xl font-bold text-[#2E7D32] tabular-nums">
                        {overview.todayMilkLitres.toFixed(1)} L
                      </div>
                      <span className="text-xs text-[#5D4B41] mt-1 block">
                        From {overview.lactatingCowsCount} of {overview.totalCowsCount} cows
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E6DEC8] p-5">
                      <span className="text-xs font-medium text-[#6D5649]">Today’s Sales</span>
                      <div className="mt-2 font-mono text-2xl font-bold text-[#2C1E16] tabular-nums">
                        {formatKes(overview.todaySalesKes)}
                      </div>
                      <span className="text-xs text-[#5D4B41] mt-1 block">
                        Direct online &amp; M-Pesa orders
                      </span>
                    </div>

                    <div className="bg-white rounded-xl border border-[#E6DEC8] p-5">
                      <span className="text-xs font-medium text-[#6D5649]">
                        Orders Pending Delivery
                      </span>
                      <div className="mt-2 font-mono text-2xl font-bold text-[#B45309] tabular-nums">
                        {overview.pendingOrdersCount}
                      </div>
                      <span className="text-xs text-[#5D4B41] mt-1 block">
                        Received, Preparing, or En route
                      </span>
                    </div>
                  </div>

                  {/* 30-Day Production vs Sales Chart */}
                  <div className="bg-white rounded-xl border border-[#E6DEC8] p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <h2 className="font-display text-lg font-semibold text-[#2C1E16]">
                          30-Day Production vs Sales
                        </h2>
                        <p className="text-xs text-[#6D5649]">
                          Daily total herd litres collected alongside KES shop revenue
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleGenerateInsights()}
                        disabled={insightsLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
                      >
                        <Sparkles className="w-4 h-4" aria-hidden="true" />
                        <span>{insightsLoading ? 'Analyzing 30 days...' : 'Farm Insights'}</span>
                      </button>
                    </div>

                    <ProductionSalesChart data={overview.chart30Days} />
                  </div>

                  {/* Gemini AI Farm Insights Panel */}
                  {(insights || insightsError) && (
                    <div className="bg-[#F8FBF8] rounded-xl border border-[#C8E6C9] p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-semibold text-[#1B5E20]">
                          Chegoland AI Farm Advisor
                        </h3>
                        {insights && (
                          <span className="text-xs text-[#6D5649] font-mono">
                            {formatDateTime(insights.generatedAt)}
                          </span>
                        )}
                      </div>

                      {insightsError ? (
                        <p className="text-sm text-[#B91C1C]">{insightsError}</p>
                      ) : insights ? (
                        <>
                          <p className="text-sm text-[#2C1E16] leading-relaxed">
                            {insights.summary}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                            {insights.suggestions.map((s, idx) => (
                              <div
                                key={idx}
                                className="bg-white rounded-lg border border-[#DCE8DC] p-4"
                              >
                                <div className="text-xs font-mono text-[#2E7D32] font-semibold">
                                  0{idx + 1}. {s.title}
                                </div>
                                <p className="mt-1.5 text-xs text-[#4E3B31] leading-relaxed">
                                  {s.detail}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* COWS TAB */}
              {activeTab === 'cows' && (
                <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                        Herd Registry ({cows.length})
                      </h2>
                      <p className="text-xs text-[#6D5649]">
                        Cows shown here automatically power the public “Meet our cows” section
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewCowModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Cow
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#E6DEC8] text-xs text-[#6D5649]">
                          <th className="py-2.5 pr-4 font-medium">Cow</th>
                          <th className="py-2.5 pr-4 font-medium">Tag</th>
                          <th className="py-2.5 pr-4 font-medium">Breed</th>
                          <th className="py-2.5 pr-4 font-medium">Age</th>
                          <th className="py-2.5 pr-4 font-medium">Status</th>
                          <th className="py-2.5 pr-4 font-medium text-right">Avg L/Day</th>
                          <th className="py-2.5 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAD8]">
                        {cows.map((cow) => (
                          <tr key={cow.id} className="hover:bg-[#FCFBF7]">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <FarmImage
                                  src={cow.photo}
                                  alt={cow.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E6DEC8] shrink-0"
                                />
                                <span className="font-semibold text-[#2C1E16]">{cow.name}</span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs">{cow.tagNumber}</td>
                            <td className="py-3 pr-4 text-[#4E3B31]">{cow.breed}</td>
                            <td className="py-3 pr-4 font-mono tabular-nums">{cow.ageYears} yrs</td>
                            <td className="py-3 pr-4">
                              <span
                                className={`text-xs font-medium ${
                                  cow.status === 'Lactating'
                                    ? 'text-[#2E7D32]'
                                    : 'text-[#B45309]'
                                }`}
                              >
                                {cow.status}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right font-mono tabular-nums font-semibold">
                              {cow.dailyLitresAvg.toFixed(1)} L
                            </td>
                            <td className="py-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEditCowModal(cow)}
                                aria-label={`Edit ${cow.name}`}
                                className="p-1.5 text-[#5D4B41] hover:text-[#2E7D32] cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteCow(cow.id)}
                                aria-label={`Delete ${cow.name}`}
                                className="p-1.5 text-[#5D4B41] hover:text-[#B91C1C] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MILK RECORDS TAB */}
              {activeTab === 'milk' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => void handleAddMilkRecord(e)}
                    className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                        Log Daily Milking Yield
                      </h2>
                      <span className="text-xs font-mono text-[#2E7D32] font-semibold">
                        Today’s logged total:{' '}
                        {todayRecords
                          .reduce((s, r) => s + r.totalLitres, 0)
                          .toFixed(1)}{' '}
                        L
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                          Cow
                        </label>
                        <select
                          value={milkForm.cowId}
                          onChange={(e) =>
                            setMilkForm((p) => ({ ...p, cowId: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm"
                        >
                          {cows.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.tagNumber})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={milkForm.date}
                          onChange={(e) =>
                            setMilkForm((p) => ({ ...p, date: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                          Morning (L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={milkForm.morningLitres}
                          onChange={(e) =>
                            setMilkForm((p) => ({ ...p, morningLitres: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                          Evening (L)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={milkForm.eveningLitres}
                          onChange={(e) =>
                            setMilkForm((p) => ({ ...p, eveningLitres: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          type="submit"
                          disabled={milkSubmitting}
                          className="w-full py-2.5 px-4 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer"
                        >
                          {milkSubmitting ? 'Saving...' : 'Save Yield'}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold text-[#2C1E16]">
                        Milking History ({filteredMilkRecords.length})
                      </h3>
                      <select
                        value={milkFilterCow}
                        onChange={(e) => setMilkFilterCow(e.target.value)}
                        aria-label="Filter milk records by cow"
                        className="px-3 py-1.5 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-xs font-medium"
                      >
                        <option value="all">All Cows</option>
                        {cows.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="overflow-x-auto max-h-[420px]">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b border-[#E6DEC8] text-xs text-[#6D5649]">
                            <th className="py-2 pr-4 font-medium">Date</th>
                            <th className="py-2 pr-4 font-medium">Cow</th>
                            <th className="py-2 pr-4 font-medium text-right">Morning</th>
                            <th className="py-2 pr-4 font-medium text-right">Evening</th>
                            <th className="py-2 pr-4 font-medium text-right">Total</th>
                            <th className="py-2 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F0EAD8]">
                          {filteredMilkRecords.slice(0, 60).map((rec) => (
                            <tr key={rec.id} className="hover:bg-[#FCFBF7]">
                              <td className="py-2.5 pr-4 font-mono text-xs">{rec.date}</td>
                              <td className="py-2.5 pr-4 font-medium">{rec.cowName}</td>
                              <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                                {rec.morningLitres.toFixed(1)} L
                              </td>
                              <td className="py-2.5 pr-4 text-right font-mono tabular-nums">
                                {rec.eveningLitres.toFixed(1)} L
                              </td>
                              <td className="py-2.5 pr-4 text-right font-mono tabular-nums font-semibold text-[#2E7D32]">
                                {rec.totalLitres.toFixed(1)} L
                              </td>
                              <td className="py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteMilkRecord(rec.id)}
                                  aria-label="Delete record"
                                  className="p-1 text-[#6D5649] hover:text-[#B91C1C] cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeTab === 'products' && (
                <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                        Shop Catalog &amp; Stock ({products.length})
                      </h2>
                      <p className="text-xs text-[#6D5649]">
                        Adjust prices or stock levels live for the online storefront
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewProductModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-[#E6DEC8] text-xs text-[#6D5649]">
                          <th className="py-2.5 pr-4 font-medium">Product</th>
                          <th className="py-2.5 pr-4 font-medium">Category</th>
                          <th className="py-2.5 pr-4 font-medium text-right">Price (KES)</th>
                          <th className="py-2.5 pr-4 font-medium text-right">Stock</th>
                          <th className="py-2.5 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EAD8]">
                        {products.map((p) => (
                          <tr key={p.id} className="hover:bg-[#FCFBF7]">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <FarmImage
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#E6DEC8] shrink-0"
                                />
                                <div>
                                  <div className="font-semibold text-[#2C1E16]">{p.name}</div>
                                  <div className="text-xs text-[#6D5649]">{p.unit}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-xs text-[#5D4B41]">{p.category}</td>
                            <td className="py-3 pr-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <span className="font-mono font-semibold tabular-nums">
                                  {formatKes(p.priceKes)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuickProductAdjust(p, 'priceKes', p.priceKes + 10)
                                  }
                                  className="px-1.5 py-0.5 text-[11px] rounded border border-[#D8CEB8] hover:bg-[#F5EFE0] font-mono cursor-pointer"
                                  title="Increase by KES 10"
                                >
                                  +10
                                </button>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuickProductAdjust(p, 'stock', p.stock - 1)
                                  }
                                  className="w-6 h-6 rounded border border-[#D8CEB8] hover:bg-[#F5EFE0] text-xs font-mono cursor-pointer"
                                >
                                  -
                                </button>
                                <span
                                  className={`w-8 text-center font-mono font-semibold tabular-nums ${
                                    p.stock === 0
                                      ? 'text-[#B91C1C]'
                                      : p.stock <= p.lowStockThreshold
                                      ? 'text-[#B45309]'
                                      : 'text-[#2E7D32]'
                                  }`}
                                >
                                  {p.stock}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleQuickProductAdjust(p, 'stock', p.stock + 5)
                                  }
                                  className="px-1.5 h-6 rounded border border-[#D8CEB8] hover:bg-[#F5EFE0] text-xs font-mono cursor-pointer"
                                >
                                  +5
                                </button>
                              </div>
                            </td>
                            <td className="py-3 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openEditProductModal(p)}
                                aria-label={`Edit ${p.name}`}
                                className="p-1.5 text-[#5D4B41] hover:text-[#2E7D32] cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteProduct(p.id)}
                                aria-label={`Delete ${p.name}`}
                                className="p-1.5 text-[#5D4B41] hover:text-[#B91C1C] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                      Customer Orders ({filteredOrders.length})
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {(['All', 'Received', 'Preparing', 'Out for Delivery', 'Delivered'] as const).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setOrderStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                              orderStatusFilter === st
                                ? 'bg-[#2E7D32] text-white'
                                : 'bg-[#FAF4E4] text-[#4E3B31] hover:bg-[#EFE8D5]'
                            }`}
                          >
                            {st}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filteredOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-xl border border-[#E6DEC8] bg-[#FCFBF7] flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D5649]">
                            <span className="font-mono font-bold text-[#2C1E16]">
                              {ord.orderNumber}
                            </span>
                            <span>·</span>
                            <span>{formatShortDate(ord.createdAt)}</span>
                            <span>·</span>
                            <span>
                              {ord.paymentMethod} ({ord.paymentStatus})
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-[#2C1E16]">
                            {ord.customerName} · <span className="font-mono">{ord.phone}</span> ·{' '}
                            {ord.deliveryArea}
                          </div>
                          <div className="text-xs text-[#5D4B41]">
                            {ord.items
                              .map((i) => `${i.name} (${i.unit}) ×${i.quantity}`)
                              .join(', ')}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-sm text-[#2E7D32] tabular-nums">
                            {formatKes(ord.totalKes)}
                          </span>

                          <select
                            value={ord.status}
                            onChange={(e) =>
                              void handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            aria-label={`Status for ${ord.orderNumber}`}
                            className="px-2.5 py-1.5 rounded-lg border border-[#D8CEB8] bg-white text-xs font-medium"
                          >
                            <option value="Received">Received</option>
                            <option value="Preparing">Preparing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setSelectedOrderNote(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8CEB8] bg-white hover:bg-[#F5EFE0] text-xs font-medium cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Delivery Note
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                <div className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-4">
                  <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
                    Contact Submissions ({messages.length})
                  </h2>

                  {messages.length === 0 ? (
                    <p className="text-sm text-[#6D5649] py-6">No customer messages yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-xl border ${
                            msg.read
                              ? 'border-[#E6DEC8] bg-[#FCFBF7]'
                              : 'border-[#2E7D32]/40 bg-[#F4FAF4]'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-semibold text-[#2C1E16]">
                                {msg.subject}
                              </div>
                              <div className="text-xs text-[#6D5649] mt-0.5">
                                {msg.name} · <span className="font-mono">{msg.phone}</span>
                                {msg.email ? ` · ${msg.email}` : ''} ·{' '}
                                {formatDateTime(msg.createdAt)}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => void handleToggleMessageRead(msg)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#D8CEB8] bg-white text-xs font-medium text-[#3E2723] cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5 text-[#2E7D32]" />
                              {msg.read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                          </div>
                          <p className="mt-3 text-sm text-[#3E2723] leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Cow Modal */}
      {cowModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={(e) => void handleSaveCow(e)}
            className="bg-white rounded-2xl border border-[#D8CEB8] max-w-lg w-full p-6 space-y-4 shadow-2xl"
          >
            <h2 className="font-display text-xl font-bold text-[#2C1E16]">
              {editingCow ? `Edit ${editingCow.name}` : 'Add New Cow'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Name</label>
                <input
                  required
                  value={cowForm.name}
                  onChange={(e) => setCowForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Tag Number
                </label>
                <input
                  required
                  value={cowForm.tagNumber}
                  onChange={(e) => setCowForm((f) => ({ ...f, tagNumber: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Breed</label>
                <select
                  value={cowForm.breed}
                  onChange={(e) =>
                    setCowForm((f) => ({ ...f, breed: e.target.value as CowBreed }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                >
                  <option value="Friesian">Friesian</option>
                  <option value="Ayrshire">Ayrshire</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Guernsey">Guernsey</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Status</label>
                <select
                  value={cowForm.status}
                  onChange={(e) =>
                    setCowForm((f) => ({ ...f, status: e.target.value as CowStatus }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                >
                  <option value="Lactating">Lactating</option>
                  <option value="Dry">Dry</option>
                  <option value="Heifer">Heifer</option>
                  <option value="Resting">Resting</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cowForm.ageYears}
                  onChange={(e) =>
                    setCowForm((f) => ({ ...f, ageYears: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Daily Avg (L)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={cowForm.dailyLitresAvg}
                  onChange={(e) =>
                    setCowForm((f) => ({ ...f, dailyLitresAvg: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5D4B41] mb-1">Photo</label>
              <select
                value={cowForm.photo}
                onChange={(e) => setCowForm((f) => ({ ...f, photo: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
              >
                {COW_PHOTO_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5D4B41] mb-1">Notes</label>
              <textarea
                rows={2}
                value={cowForm.bio}
                onChange={(e) => setCowForm((f) => ({ ...f, bio: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCowModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#D8CEB8] text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white text-sm font-semibold cursor-pointer"
              >
                Save Cow
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {productModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={(e) => void handleSaveProduct(e)}
            className="bg-white rounded-2xl border border-[#D8CEB8] max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-display text-xl font-bold text-[#2C1E16]">
              {editingProduct ? `Edit ${editingProduct.name}` : 'Add New Product'}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Name (English)
                </label>
                <input
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Name (Kiswahili)
                </label>
                <input
                  value={productForm.nameSw}
                  onChange={(e) => setProductForm((f) => ({ ...f, nameSw: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm((f) => ({
                      ...f,
                      category: e.target.value as ProductCategory,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                >
                  <option value="Milk">Milk</option>
                  <option value="Fermented">Fermented</option>
                  <option value="Cultured & Fats">Cultured &amp; Fats</option>
                  <option value="Eggs">Eggs</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Unit</label>
                <input
                  required
                  value={productForm.unit}
                  onChange={(e) => setProductForm((f) => ({ ...f, unit: e.target.value }))}
                  placeholder="1L, 500ml, 250g"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                  Price (KES)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={productForm.priceKes}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, priceKes: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5D4B41] mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={productForm.stock}
                  onChange={(e) =>
                    setProductForm((f) => ({ ...f, stock: Number(e.target.value) }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5D4B41] mb-1">Image</label>
              <select
                value={productForm.image}
                onChange={(e) => setProductForm((f) => ({ ...f, image: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
              >
                {PRODUCT_PHOTO_PRESETS.map((p) => (
                  <option key={p.url} value={p.url}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5D4B41] mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, description: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg border border-[#D8CEB8] text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#2C1E16]">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(e) =>
                  setProductForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              Feature on Home page
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#D8CEB8] text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#2E7D32] text-white text-sm font-semibold cursor-pointer"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Printable Delivery Note Modal */}
      {selectedOrderNote && (
        <DeliveryNoteModal
          order={selectedOrderNote}
          onClose={() => setSelectedOrderNote(null)}
        />
      )}
    </div>
  );
}
