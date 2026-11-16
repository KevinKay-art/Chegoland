import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { api } from '../api/client.ts';
import type { Order } from '../types/index.ts';
import { formatDateTime, formatKes } from '../utils/format.ts';

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    api
      .getOrderByNumber(orderNumber)
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : 'Order not found.'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <div className="h-72 rounded-2xl bg-white border border-[#E6DEC8] animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-[#E6DEC8] p-8">
          <p className="text-sm text-[#B91C1C] font-medium">{error || 'Order not found.'}</p>
          <Link
            to="/shop"
            className="mt-5 inline-flex px-5 py-2.5 rounded-lg bg-[#2E7D32] text-white text-sm font-semibold"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white rounded-2xl border border-[#E6DEC8] p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4 pb-6 border-b border-[#EFE8D5]">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-[#2E7D32]">
              Order Confirmed · {formatDateTime(order.createdAt)}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#2C1E16] mt-0.5">
              Asante, {order.customerName}!
            </h1>
            <p className="text-sm text-[#5D4B41] mt-1">
              Your order <span className="font-mono font-semibold text-[#2C1E16]">{order.orderNumber}</span> has been received by the CHEGOLAND Agri-Empire LTD Dairy Farm and Shop dispatch team.
            </p>
          </div>
        </div>

        <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-b border-[#EFE8D5]">
          <div>
            <span className="text-xs text-[#6D5649] block">Delivery Address</span>
            <span className="font-medium text-[#2C1E16]">{order.deliveryArea}</span>
            {order.deliveryNotes && (
              <p className="text-xs text-[#5D4B41] mt-1">{order.deliveryNotes}</p>
            )}
          </div>
          <div>
            <span className="text-xs text-[#6D5649] block">Payment</span>
            <span className="font-medium text-[#2C1E16]">
              {order.paymentMethod} · {order.paymentStatus}
            </span>
            {order.mpesaReceipt && (
              <p className="text-xs font-mono text-[#2E7D32] mt-1">
                M-Pesa Receipt: {order.mpesaReceipt}
              </p>
            )}
          </div>
        </div>

        <div className="py-5 space-y-2.5 text-sm border-b border-[#EFE8D5]">
          <h2 className="font-semibold text-[#2C1E16] mb-3">Order Summary</h2>
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span className="text-[#3E2723]">
                {item.name} ({item.unit}) × {item.quantity}
              </span>
              <span className="font-mono tabular-nums font-medium text-[#2C1E16]">
                {formatKes(item.priceKes * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex justify-between text-[#5D4B41] pt-2">
            <span>Delivery Fee</span>
            <span className="font-mono tabular-nums">
              {order.deliveryFeeKes === 0 ? 'KES 0' : formatKes(order.deliveryFeeKes)}
            </span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#2C1E16] pt-2 border-t border-[#F0EAD8]">
            <span>Total</span>
            <span className="font-mono tabular-nums text-[#2E7D32]">
              {formatKes(order.totalKes)}
            </span>
          </div>
        </div>

        <div className="pt-6 flex flex-wrap gap-3">
          <Link
            to={`/track?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.phone)}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold"
          >
            <PackageCheck className="w-4 h-4" aria-hidden="true" />
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#D8CEB8] hover:bg-[#F5EFE0] text-sm font-medium text-[#2C1E16]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
