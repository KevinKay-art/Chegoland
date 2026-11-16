import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Package, Search, Truck } from 'lucide-react';
import { api } from '../api/client.ts';
import { useAppContext } from '../hooks/useAppContext.tsx';
import type { Order, OrderStatus } from '../types/index.ts';
import { formatDateTime, formatKes, isValidKenyanPhone } from '../utils/format.ts';

const STATUS_STEPS: OrderStatus[] = [
  'Received',
  'Preparing',
  'Out for Delivery',
  'Delivered',
];

export function TrackOrderPage() {
  const { t } = useAppContext();
  const [searchParams] = useSearchParams();

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get('orderNumber') || ''
  );
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookupOrder(ordNum: string, ph: string) {
    setError(null);
    if (!ordNum.trim()) {
      setError('Please enter your order number (e.g. CHG-2026-1001).');
      return;
    }
    if (!isValidKenyanPhone(ph)) {
      setError('Please enter the Kenyan phone number used for the order.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.trackOrder(ordNum.trim(), ph.trim());
      setOrder(result);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Unable to find matching order.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const qOrd = searchParams.get('orderNumber');
    const qPh = searchParams.get('phone');
    if (qOrd && qPh) {
      void lookupOrder(qOrd, qPh);
    }
  }, [searchParams]);

  const currentStageIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16]">
          {t.track.heading}
        </h1>
        <p className="mt-2.5 text-base text-[#5D4B41] leading-relaxed">
          {t.track.subheading}
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void lookupOrder(orderNumber, phone);
        }}
        className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-4"
        noValidate
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="track-order-number"
              className="block text-sm font-medium text-[#3E2723] mb-1.5"
            >
              {t.track.orderNumberLabel}
            </label>
            <input
              id="track-order-number"
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="CHG-2026-1001"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
            />
          </div>
          <div>
            <label
              htmlFor="track-phone"
              className="block text-sm font-medium text-[#3E2723] mb-1.5"
            >
              {t.track.phoneLabel}
            </label>
            <input
              id="track-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] font-mono text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              setOrderNumber('CHG-2026-1001');
              setPhone('0712345678');
              void lookupOrder('CHG-2026-1001', '0712345678');
            }}
            className="text-xs text-[#0284C7] hover:underline text-left cursor-pointer"
          >
            {t.track.sampleHint}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white text-sm font-semibold cursor-pointer"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>{loading ? t.track.searching : t.track.searchBtn}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
            {error}
          </div>
        )}
      </form>

      {order && (
        <div className="mt-8 bg-white rounded-xl border border-[#E6DEC8] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EFE8D5]">
            <div>
              <p className="text-xs text-[#6D5649]">
                Order <span className="font-mono font-semibold text-[#2C1E16]">{order.orderNumber}</span>
              </p>
              <h2 className="font-display text-2xl font-bold text-[#2C1E16] mt-0.5">
                {order.status}
              </h2>
            </div>
            <div className="text-sm text-[#5D4B41] sm:text-right">
              <div>{order.deliveryArea}</div>
              <div className="text-xs text-[#6D5649]">
                Updated {formatDateTime(order.updatedAt)}
              </div>
            </div>
          </div>

          {/* 4-Step Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STATUS_STEPS.map((step, idx) => {
              const completed = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={step}
                  className={`p-3.5 rounded-xl border ${
                    completed
                      ? 'bg-[#E8F5E9]/70 border-[#2E7D32]/40 text-[#1B5E20]'
                      : 'bg-[#FCFBF7] border-[#E6DEC8] text-[#8D7B71]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold">0{idx + 1}</span>
                    {completed ? (
                      step === 'Out for Delivery' ? (
                        <Truck className="w-4 h-4" aria-hidden="true" />
                      ) : step === 'Preparing' ? (
                        <Package className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Check className="w-4 h-4" aria-hidden="true" />
                      )
                    ) : null}
                  </div>
                  <div className={`text-sm font-semibold ${isCurrent ? 'underline underline-offset-4' : ''}`}>
                    {step}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Items */}
          <div className="pt-4 border-t border-[#EFE8D5] space-y-2 text-sm">
            <h3 className="font-semibold text-[#2C1E16] mb-2">Items &amp; Payment</h3>
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-[#3E2723]">
                <span>
                  {item.name} ({item.unit}) × {item.quantity}
                </span>
                <span className="font-mono tabular-nums">
                  {formatKes(item.priceKes * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-[#F0EAD8] font-bold text-[#2C1E16]">
              <span>
                Total ({order.paymentMethod} · {order.paymentStatus})
              </span>
              <span className="font-mono tabular-nums text-[#2E7D32]">
                {formatKes(order.totalKes)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
