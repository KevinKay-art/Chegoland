import React, { useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Plus, XCircle } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext.tsx';
import type { Product } from '../types/index.ts';
import { formatKes } from '../utils/format.ts';
import { FarmImage } from './FarmImage.tsx';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, t, addToCart, cart } = useAppContext();
  const [justAdded, setJustAdded] = useState(false);

  const inCartQty = cart.find((c) => c.productId === product.id)?.quantity ?? 0;
  const remainingStock = Math.max(0, product.stock - inCartQty);
  const isSoldOut = product.stock <= 0;
  const isLowStock = !isSoldOut && product.stock <= product.lowStockThreshold;
  const maxReached = !isSoldOut && remainingStock <= 0;

  const displayName = language === 'sw' ? product.nameSw : product.name;
  const displayDesc = language === 'sw' ? product.descriptionSw : product.description;

  function handleAdd() {
    const res = addToCart(product, 1);
    if (res.ok) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  }

  return (
    <article className="group bg-white rounded-xl border border-[#E6DEC8] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#F5EFE0] relative">
        <FarmImage
          src={product.image}
          alt={`${displayName} (${product.unit})`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          fallbackTitle={displayName}
        />
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Clean unboxed metadata + semantic stock status */}
        <div className="flex items-center justify-between gap-2 text-xs mb-2">
          <span className="text-[#6D5649] font-medium">
            {t.shop.categories[product.category]} · {product.unit}
          </span>

          {isSoldOut ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#B91C1C]">
              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {t.shop.soldOut}
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#B45309]">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              {t.shop.lowStock} ({product.stock})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-medium text-[#2E7D32]">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              {t.shop.inStock}
            </span>
          )}
        </div>

        <h3 className="font-display text-lg font-semibold text-[#2C1E16] leading-snug">
          {displayName}
        </h3>

        <p className="mt-1.5 text-sm text-[#5D4B41] leading-relaxed line-clamp-2 flex-1">
          {displayDesc}
        </p>

        <div className="mt-4 pt-4 border-t border-[#F0EAD8] flex items-center justify-between gap-3">
          <div>
            <span className="block text-base font-bold text-[#2C1E16] tabular-nums font-mono">
              {formatKes(product.priceKes)}
            </span>
            {inCartQty > 0 && (
              <span className="text-[11px] text-[#2E7D32] font-medium tabular-nums">
                {inCartQty} in basket
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isSoldOut || maxReached}
            onClick={handleAdd}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-lg text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
              isSoldOut || maxReached
                ? 'bg-[#EFEAE0] text-[#8D7B71] cursor-not-allowed'
                : justAdded
                ? 'bg-[#1B5E20] text-white cursor-pointer'
                : 'bg-[#2E7D32] hover:bg-[#1B5E20] text-white cursor-pointer'
            }`}
          >
            {isSoldOut ? (
              t.shop.soldOut
            ) : maxReached ? (
              t.shop.maxInCart
            ) : justAdded ? (
              <>
                <Check className="w-4 h-4" aria-hidden="true" />
                {t.shop.added}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" aria-hidden="true" />
                {t.shop.addToCart}
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
