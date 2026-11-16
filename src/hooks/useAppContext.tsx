import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.ts';
import { TRANSLATIONS, type TranslationBundle } from '../i18n/translations.ts';
import type { Language, Product } from '../types/index.ts';

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface HydratedCartItem {
  product: Product;
  quantity: number;
  lineTotalKes: number;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationBundle;
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  hydratedCart: HydratedCartItem[];
  cartCount: number;
  cartSubtotalKes: number;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
  addToCart: (product: Product, qty?: number) => { ok: boolean; reason?: string };
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const CART_STORAGE_KEY = 'chegoland_cart_v1';
const LANG_STORAGE_KEY = 'chegoland_lang_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return saved === 'sw' ? 'sw' : 'en';
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const refreshProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'Unable to load products.');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  // Clamp cart quantities whenever fresh product stock arrives
  useEffect(() => {
    if (products.length === 0) return;
    setCart((prev) =>
      prev
        .map((item) => {
          const prod = products.find((p) => p.id === item.productId);
          if (!prod || prod.stock <= 0) return null;
          return {
            productId: item.productId,
            quantity: Math.min(item.quantity, prod.stock),
          };
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, [products]);

  const addToCart = useCallback(
    (product: Product, qty = 1): { ok: boolean; reason?: string } => {
      if (product.stock <= 0) {
        return { ok: false, reason: 'Sold out' };
      }

      let added = false;
      let reason: string | undefined;

      setCart((prev) => {
        const existing = prev.find((i) => i.productId === product.id);
        const currentQty = existing?.quantity ?? 0;
        const desired = currentQty + qty;
        if (desired > product.stock) {
          reason = `Only ${product.stock} available in stock.`;
          return prev;
        }
        added = true;
        if (existing) {
          return prev.map((i) =>
            i.productId === product.id ? { ...i, quantity: desired } : i
          );
        }
        return [...prev, { productId: product.id, quantity: qty }];
      });

      return { ok: added, reason };
    },
    []
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      const prod = products.find((p) => p.id === productId);
      const maxStock = prod ? prod.stock : 99;
      if (quantity <= 0) {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
        return;
      }
      const clamped = Math.min(quantity, maxStock);
      setCart((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: clamped } : i))
      );
    },
    [products]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const hydratedCart = useMemo<HydratedCartItem[]>(() => {
    return cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          product,
          quantity: item.quantity,
          lineTotalKes: product.priceKes * item.quantity,
        };
      })
      .filter((x): x is HydratedCartItem => x !== null);
  }, [cart, products]);

  const cartCount = useMemo(
    () => hydratedCart.reduce((sum, item) => sum + item.quantity, 0),
    [hydratedCart]
  );

  const cartSubtotalKes = useMemo(
    () => hydratedCart.reduce((sum, item) => sum + item.lineTotalKes, 0),
    [hydratedCart]
  );

  const value: AppContextValue = {
    language,
    setLanguage,
    t: TRANSLATIONS[language],
    products,
    productsLoading,
    productsError,
    refreshProducts,
    cart,
    hydratedCart,
    cartCount,
    cartSubtotalKes,
    cartDrawerOpen,
    setCartDrawerOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return ctx;
}
