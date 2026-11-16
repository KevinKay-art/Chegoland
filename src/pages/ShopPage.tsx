import React, { useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import type { ProductCategory } from '../types/index.ts';

const CATEGORIES: Array<'All' | ProductCategory> = [
  'All',
  'Milk',
  'Fermented',
  'Cultured & Fats',
  'Eggs',
];

export function ShopPage() {
  const { language, t, products, productsLoading, productsError, refreshProducts } =
    useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      const haystack = `${p.name} ${p.nameSw} ${p.unit} ${p.description} ${p.category}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16]">
          {t.shop.heading}
        </h1>
        <p className="mt-2.5 text-base text-[#5D4B41] leading-relaxed">{t.shop.subheading}</p>
      </div>

      {/* Category Filter + Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E6DEC8]">
        <div
          className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5EFE0] rounded-xl border border-[#E6DEC8]"
          role="tablist"
          aria-label="Product categories"
        >
          {CATEGORIES.map((cat) => {
            const label =
              cat === 'All' ? t.shop.allCategories : t.shop.categories[cat];
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#2E7D32] shadow-sm font-semibold'
                    : 'text-[#5D4B41] hover:text-[#2C1E16]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80">
          <Search
            className="w-4 h-4 text-[#6D5649] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.shop.searchPlaceholder}
            aria-label={t.shop.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 min-h-[42px] rounded-xl border border-[#D8CEB8] bg-white text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
      </div>

      {/* States: Loading / Error / Empty / Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-xl bg-white border border-[#E6DEC8] animate-pulse"
            />
          ))}
        </div>
      ) : productsError ? (
        <div className="p-8 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-center">
          <p className="text-sm font-medium text-[#B91C1C]">{productsError}</p>
          <button
            type="button"
            onClick={() => void refreshProducts()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2E7D32] text-white text-sm font-semibold cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 px-6 rounded-xl bg-white border border-[#E6DEC8] text-center">
          <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
            {t.shop.emptyTitle}
          </h2>
          <p className="mt-2 text-sm text-[#5D4B41]">{t.shop.emptyDesc}</p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-5 px-5 py-2.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer"
          >
            {t.shop.resetFilters}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Subtle bilingual nutrition note */}
      <p className="mt-10 text-xs text-[#6D5649] text-center">
        {language === 'sw'
          ? 'Bei zote zimeorodheshwa kwa Shilingi ya Kenya (KES). Hifadhi ya shamba husasishwa papo hapo.'
          : 'All prices listed in Kenyan Shillings (KES). Farm stock updates live with every order.'}
      </p>
    </div>
  );
}
