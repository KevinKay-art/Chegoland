import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext.tsx';
import { DELIVERY_FEE_KES, FREE_DELIVERY_THRESHOLD_KES } from '../i18n/translations.ts';
import { formatKes } from '../utils/format.ts';
import { FarmImage } from './FarmImage.tsx';

export function CartDrawer() {
  const {
    language,
    t,
    hydratedCart,
    cartSubtotalKes,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
  } = useAppContext();

  if (!cartDrawerOpen) return null;

  const deliveryFee =
    hydratedCart.length === 0
      ? 0
      : cartSubtotalKes >= FREE_DELIVERY_THRESHOLD_KES
      ? 0
      : DELIVERY_FEE_KES;
  const total = cartSubtotalKes + deliveryFee;
  const remainingForFree = Math.max(0, FREE_DELIVERY_THRESHOLD_KES - cartSubtotalKes);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={t.cart.title}
    >
      <div
        className="flex-1"
        onClick={() => setCartDrawerOpen(false)}
        aria-hidden="true"
      />
      <div className="w-full max-w-md bg-[#FFFDF7] h-full shadow-2xl border-l border-[#E6DEC8] flex flex-col">
        <div className="px-5 py-4 border-b border-[#E6DEC8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#2E7D32]" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.cart.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close basket"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-[#5D4B41] hover:bg-[#F5EFE0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {hydratedCart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#2C1E16]">
                {t.cart.emptyTitle}
              </h3>
              <p className="mt-2 text-sm text-[#5D4B41] max-w-xs">{t.cart.emptyDesc}</p>
              <Link
                to="/shop"
                onClick={() => setCartDrawerOpen(false)}
                className="mt-5 px-5 py-2.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors"
              >
                {t.cart.browseShop}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {hydratedCart.map(({ product, quantity, lineTotalKes }) => {
                const name = language === 'sw' ? product.nameSw : product.name;
                return (
                  <div
                    key={product.id}
                    className="flex gap-3.5 pb-4 border-b border-[#EFE8D5]"
                  >
                    <FarmImage
                      src={product.image}
                      alt={name}
                      className="w-20 h-16 rounded-lg object-cover shrink-0 border border-[#E6DEC8]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-[#2C1E16] truncate">
                            {name}
                          </h4>
                          <p className="text-xs text-[#6D5649]">
                            {product.unit} · {formatKes(product.priceKes)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${name}`}
                          className="text-[#8D7B71] hover:text-[#B91C1C] p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#D8CEB8] rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(product.id, quantity - 1)}
                            aria-label="Decrease quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#3E2723] hover:bg-[#F5EFE0] rounded-l-lg cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-mono font-semibold tabular-nums">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            disabled={quantity >= product.stock}
                            onClick={() => updateCartQuantity(product.id, quantity + 1)}
                            aria-label="Increase quantity"
                            className="w-8 h-8 flex items-center justify-center text-[#3E2723] hover:bg-[#F5EFE0] disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-semibold text-[#2C1E16] font-mono tabular-nums">
                          {formatKes(lineTotalKes)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {hydratedCart.length > 0 && (
          <div className="p-5 border-t border-[#E6DEC8] bg-[#FAF4E4] space-y-3">
            <div className="text-xs text-[#0369A1] bg-[#E3F2FD] px-3 py-2 rounded-lg font-medium">
              {remainingForFree === 0
                ? t.cart.freeDeliveryUnlocked
                : t.cart.freeDeliveryHint.replace('{amount}', formatKes(remainingForFree))}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-[#5D4B41]">
                <span>{t.cart.subtotal}</span>
                <span className="font-mono tabular-nums">{formatKes(cartSubtotalKes)}</span>
              </div>
              <div className="flex justify-between text-[#5D4B41]">
                <span>{t.cart.deliveryFee}</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? 'KES 0' : formatKes(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#2C1E16] pt-2 border-t border-[#E6DEC8]">
                <span>{t.cart.total}</span>
                <span className="font-mono tabular-nums">{formatKes(total)}</span>
              </div>
            </div>

            <Link
              to="/cart"
              onClick={() => setCartDrawerOpen(false)}
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold transition-colors"
            >
              {t.cart.proceedCheckout}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
