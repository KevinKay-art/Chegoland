export type Language = 'en' | 'sw';

export type ProductCategory = 'Milk' | 'Fermented' | 'Cultured & Fats' | 'Eggs';

export interface Product {
  id: string;
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
}

export type CowBreed = 'Friesian' | 'Ayrshire' | 'Jersey' | 'Guernsey';
export type CowStatus = 'Lactating' | 'Dry' | 'Heifer' | 'Resting';

export interface Cow {
  id: string;
  name: string;
  tagNumber: string;
  breed: CowBreed;
  ageYears: number;
  status: CowStatus;
  dailyLitresAvg: number;
  photo: string;
  bio: string;
}

export interface MilkRecord {
  id: string;
  cowId: string;
  cowName: string;
  date: string; // YYYY-MM-DD
  morningLitres: number;
  eveningLitres: number;
  totalLitres: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  priceKes: number;
  quantity: number;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Out for Delivery' | 'Delivered';
export type PaymentMethod = 'M-Pesa' | 'Cash on Delivery';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryArea: string;
  deliveryNotes: string;
  items: OrderItem[];
  subtotalKes: number;
  deliveryFeeKes: number;
  totalKes: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaReceipt?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChegolandDatabase {
  products: Product[];
  cows: Cow[];
  milkRecords: MilkRecord[];
  orders: Order[];
  messages: ContactMessage[];
}

export interface DailyChartPoint {
  date: string;
  label: string;
  milkLitres: number;
  salesKes: number;
}

export interface FarmOverviewStats {
  todayMilkLitres: number;
  todaySalesKes: number;
  pendingOrdersCount: number;
  lactatingCowsCount: number;
  totalCowsCount: number;
  unreadMessagesCount: number;
  chart30Days: DailyChartPoint[];
}

export interface FarmInsightsResponse {
  summary: string;
  suggestions: Array<{
    title: string;
    detail: string;
  }>;
  generatedAt: string;
}
