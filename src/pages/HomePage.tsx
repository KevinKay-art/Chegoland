import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, ShieldCheck, Truck } from 'lucide-react';
import { api } from '../api/client.ts';
import { FarmImage } from '../components/FarmImage.tsx';
import { ProductCard } from '../components/ProductCard.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import type { Cow } from '../types/index.ts';

const HERO_PASTURE_IMAGE = '/src/assets/images/hero_pasture_cows_1794817658643.jpg';

const TESTIMONIALS = [
  {
    name: 'Wanjiku Mwangi',
    role: 'Home Customer · Kilimani, Nairobi',
    quote:
      'Before Chegoland, supermarket milk never formed proper cream for morning chai. Switching to their 1L glass-chilled milk gave us thick natural cream and reliable 7 AM doorstep delivery.',
  },
  {
    name: 'Peter Kamau',
    role: 'Head Barista · Kahawa Roasters, Westlands',
    quote:
      'Consistent butterfat makes or breaks espresso steaming. Chegoland’s 5L farm cans arrive cold every Monday and Thursday, giving our flat whites clean sweetness with zero off-flavours.',
  },
  {
    name: 'Grace Chebet',
    role: 'Nutritionist & Mother · Kaplong, Sotik',
    quote:
      'Knowing the exact cows and milking schedule behind our mala and golden ghee gives me complete confidence for my children’s meals.',
  },
];

export function HomePage() {
  const { t, products, productsLoading } = useAppContext();
  const [cows, setCows] = useState<Cow[]>([]);
  const [cowsLoading, setCowsLoading] = useState(true);
  const [cowsError, setCowsError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setCowsLoading(true);
    api
      .getCows()
      .then((data) => {
        if (active) setCows(data);
      })
      .catch((err) => {
        if (active) setCowsError(err instanceof Error ? err.message : 'Unable to load herd.');
      })
      .finally(() => {
        if (active) setCowsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);

  return (
    <div>
      {/* Full-width Pasture Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#3E2723]">
        <div className="absolute inset-0">
          <FarmImage
            src={HERO_PASTURE_IMAGE}
            alt="Friesian and Ayrshire dairy cows grazing on green Chegoland pasture in Kapcholyo, Kaplong"
            eager
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-[#142215]/90 via-[#142215]/60 to-[#142215]/20"
            aria-hidden="true"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[#E3F2FD] tracking-wide mb-3">
              {t.hero.kicker}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] text-balance">
              {t.hero.headline}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#F5EFE0] leading-relaxed max-w-xl">
              {t.hero.subheading}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 min-h-[48px] rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-base font-semibold shadow-lg transition-colors"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-base font-medium border border-white/30 transition-colors"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width 3-column Farm Standards Strip below hero */}
      <section className="bg-[#FAF4E4] border-b border-[#E6DEC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <span className="text-xs font-medium text-[#6D5649]">{t.hero.stat1Label}</span>
            <span className="font-display text-lg font-bold text-[#2E7D32] tabular-nums">
              {t.hero.stat1Value}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-center gap-4 sm:border-x sm:border-[#E6DEC8] sm:px-6">
            <span className="text-xs font-medium text-[#6D5649]">{t.hero.stat2Label}</span>
            <span className="font-display text-lg font-bold text-[#2E7D32]">
              {t.hero.stat2Value}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-xs font-medium text-[#6D5649]">{t.hero.stat3Label}</span>
            <span className="font-display text-lg font-bold text-[#2E7D32] tabular-nums">
              {t.hero.stat3Value}
            </span>
          </div>
        </div>
      </section>

      {/* Meet our cows */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16] text-balance">
            {t.home.cowsHeading}
          </h2>
          <p className="mt-3 text-base text-[#5D4B41] leading-relaxed">{t.home.cowsSub}</p>
        </div>

        {cowsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 rounded-xl bg-[#F5EFE0] animate-pulse border border-[#E6DEC8]"
              />
            ))}
          </div>
        ) : cowsError ? (
          <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
            {cowsError}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cows.slice(0, 4).map((cow) => (
              <article
                key={cow.id}
                className="bg-white rounded-xl border border-[#E6DEC8] overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-[#F5EFE0] overflow-hidden">
                  <FarmImage
                    src={cow.photo}
                    alt={`${cow.name}, ${cow.breed} dairy cow`}
                    className="w-full h-full object-cover"
                    fallbackTitle={cow.name}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-[#6D5649] font-medium">
                    <span>{cow.breed}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{cow.tagNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>{cow.ageYears} yrs</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-semibold text-[#2C1E16]">
                    {cow.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-[#5D4B41] leading-relaxed flex-1">
                    {cow.bio}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#F0EAD8] flex items-baseline justify-between">
                    <span className="text-xs text-[#6D5649]">{t.home.dailyYieldLabel}</span>
                    <span className="font-mono text-base font-bold text-[#2E7D32] tabular-nums">
                      {cow.dailyLitresAvg.toFixed(1)} L
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="bg-[#FAF4E4] border-y border-[#E6DEC8] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16] text-balance">
                {t.home.featuredHeading}
              </h2>
              <p className="mt-3 text-base text-[#5D4B41] leading-relaxed">
                {t.home.featuredSub}
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20] whitespace-nowrap shrink-0"
            >
              <span>{t.home.viewAllShop}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-96 rounded-xl bg-white/70 animate-pulse border border-[#E6DEC8]"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Chegoland + Adjacent Customer Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16] text-balance">
            {t.home.whyHeading}
          </h2>
          <p className="mt-3 text-base text-[#5D4B41] leading-relaxed">{t.home.whySub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-14 border-b border-[#E6DEC8]">
          <div className="bg-white p-6 rounded-xl border border-[#E6DEC8]">
            <div className="w-11 h-11 rounded-lg bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-4">
              <Droplets className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.home.why1Title}
            </h3>
            <p className="mt-2 text-sm text-[#5D4B41] leading-relaxed">{t.home.why1Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E6DEC8]">
            <div className="w-11 h-11 rounded-lg bg-[#E3F2FD] text-[#0284C7] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.home.why2Title}
            </h3>
            <p className="mt-2 text-sm text-[#5D4B41] leading-relaxed">{t.home.why2Desc}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E6DEC8]">
            <div className="w-11 h-11 rounded-lg bg-[#EFE6D5] text-[#5D4037] flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.home.why3Title}
            </h3>
            <p className="mt-2 text-sm text-[#5D4B41] leading-relaxed">{t.home.why3Desc}</p>
          </div>
        </div>

        <div className="pt-14">
          <h3 className="font-display text-2xl font-bold text-[#2C1E16] mb-8">
            {t.home.testimonialsHeading}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.name}
                className="bg-white p-6 rounded-xl border border-[#E6DEC8] flex flex-col justify-between"
              >
                <p className="text-sm text-[#3E2723] leading-relaxed">“{item.quote}”</p>
                <footer className="mt-5 pt-4 border-t border-[#F0EAD8]">
                  <div className="text-sm font-semibold text-[#2C1E16]">{item.name}</div>
                  <div className="text-xs text-[#6D5649] mt-0.5">{item.role}</div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
