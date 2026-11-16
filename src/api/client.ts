import type {
  ContactMessage,
  Cow,
  FarmInsightsResponse,
  FarmOverviewStats,
  Language,
  MilkRecord,
  Order,
  OrderStatus,
  Product,
} from '../types/index.ts';

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    const message =
      (data && typeof data.error === 'string' && data.error) ||
      `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

function adminHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

// Public API
export const api = {
  getProducts: () => apiRequest<Product[]>('/api/products'),
  getCows: () => apiRequest<Cow[]>('/api/cows'),
  trackOrder: (orderNumber: string, phone: string) =>
    apiRequest<Order>(
      `/api/orders/track?orderNumber=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`
    ),
  getOrderByNumber: (orderNumber: string) =>
    apiRequest<Order>(`/api/orders/${encodeURIComponent(orderNumber)}`),
  createOrder: (payload: {
    customerName: string;
    phone: string;
    deliveryArea: string;
    deliveryNotes: string;
    items: Array<{ productId: string; quantity: number }>;
    paymentMethod: 'M-Pesa' | 'Cash on Delivery';
  }) =>
    apiRequest<{
      order: Order;
      mpesa?: {
        checkoutRequestId: string;
        merchantRequestId: string;
        customerMessage: string;
      };
    }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  pollMpesaStatus: (checkoutRequestId: string) =>
    apiRequest<{
      checkoutRequestId: string;
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      resultDesc: string;
      mpesaReceipt?: string;
      orderNumber: string;
    }>(`/api/payments/mpesa/status/${encodeURIComponent(checkoutRequestId)}`),
  simulateMpesaOutcome: (checkoutRequestId: string, outcome: 'success' | 'failed') =>
    apiRequest<{
      checkoutRequestId: string;
      status: 'PENDING' | 'SUCCESS' | 'FAILED';
      resultDesc: string;
      mpesaReceipt?: string;
      orderNumber: string;
    }>('/api/payments/mpesa/simulate', {
      method: 'POST',
      body: JSON.stringify({ checkoutRequestId, outcome }),
    }),
  retryMpesaPayment: (orderNumber: string, phone?: string) =>
    apiRequest<{
      order: Order;
      mpesa: {
        checkoutRequestId: string;
        merchantRequestId: string;
        customerMessage: string;
      };
    }>('/api/payments/mpesa/retry', {
      method: 'POST',
      body: JSON.stringify({ orderNumber, phone }),
    }),
  sendContactMessage: (payload: {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    apiRequest<ContactMessage>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  askChegoland: (payload: {
    message: string;
    history: Array<{ role: 'user' | 'assistant'; text: string }>;
    language: Language;
  }) =>
    apiRequest<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Admin API
  adminLogin: (password: string) =>
    apiRequest<{ token: string }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  adminVerify: (token: string) =>
    apiRequest<{ ok: boolean }>('/api/admin/verify', {
      headers: adminHeaders(token),
    }),
  adminLogout: (token: string) =>
    apiRequest<{ ok: boolean }>('/api/admin/logout', {
      method: 'POST',
      headers: adminHeaders(token),
    }),
  adminGetOverview: (token: string) =>
    apiRequest<FarmOverviewStats>('/api/admin/overview', {
      headers: adminHeaders(token),
    }),
  adminGetInsights: (token: string) =>
    apiRequest<FarmInsightsResponse>('/api/admin/ai-insights', {
      method: 'POST',
      headers: adminHeaders(token),
    }),
  adminAddCow: (token: string, cow: Omit<Cow, 'id'>) =>
    apiRequest<Cow>('/api/admin/cows', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(cow),
    }),
  adminUpdateCow: (token: string, id: string, cow: Partial<Cow>) =>
    apiRequest<Cow>(`/api/admin/cows/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(cow),
    }),
  adminDeleteCow: (token: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/cows/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    }),
  adminGetMilkRecords: (token: string) =>
    apiRequest<MilkRecord[]>('/api/admin/milk-records', {
      headers: adminHeaders(token),
    }),
  adminAddMilkRecord: (
    token: string,
    payload: {
      cowId: string;
      date: string;
      morningLitres: number;
      eveningLitres: number;
      notes?: string;
    }
  ) =>
    apiRequest<MilkRecord>('/api/admin/milk-records', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(payload),
    }),
  adminDeleteMilkRecord: (token: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/milk-records/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    }),
  adminAddProduct: (token: string, product: Omit<Product, 'id'>) =>
    apiRequest<Product>('/api/admin/products', {
      method: 'POST',
      headers: adminHeaders(token),
      body: JSON.stringify(product),
    }),
  adminUpdateProduct: (token: string, id: string, product: Partial<Product>) =>
    apiRequest<Product>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: adminHeaders(token),
      body: JSON.stringify(product),
    }),
  adminDeleteProduct: (token: string, id: string) =>
    apiRequest<{ ok: boolean }>(`/api/admin/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: adminHeaders(token),
    }),
  adminGetOrders: (token: string) =>
    apiRequest<Order[]>('/api/admin/orders', {
      headers: adminHeaders(token),
    }),
  adminUpdateOrderStatus: (token: string, id: string, status: OrderStatus) =>
    apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: adminHeaders(token),
      body: JSON.stringify({ status }),
    }),
  adminGetMessages: (token: string) =>
    apiRequest<ContactMessage[]>('/api/admin/messages', {
      headers: adminHeaders(token),
    }),
  adminToggleMessageRead: (token: string, id: string, read: boolean) =>
    apiRequest<ContactMessage>(`/api/admin/messages/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      headers: adminHeaders(token),
      body: JSON.stringify({ read }),
    }),
};
