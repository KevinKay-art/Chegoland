import React from 'react';
import { Printer, X } from 'lucide-react';
import type { Order } from '../../types/index.ts';
import { formatDateTime, formatKes } from '../../utils/format.ts';

interface DeliveryNoteModalProps {
  order: Order;
  onClose: () => void;
}

export function DeliveryNoteModal({ order, onClose }: DeliveryNoteModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Delivery Note ${order.orderNumber}`}
    >
      <div className="bg-white rounded-2xl border border-[#D8CEB8] max-w-xl w-full shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6DEC8] flex items-center justify-between no-print">
          <h2 className="font-display text-lg font-semibold text-[#2C1E16]">
            Delivery Note Preview
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print Note
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close delivery note"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5D4B41] hover:bg-[#F5EFE0] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="delivery-note-print" className="p-6 sm:p-8 space-y-5 text-sm text-[#2C1E16]">
          <div className="flex items-start justify-between border-b border-[#E6DEC8] pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#2E7D32]">
                CHEGOLAND Agri-Empire LTD
              </h3>
              <p className="text-xs font-medium text-[#3E2723]">Dairy Farm and Shop</p>
              <p className="text-xs text-[#6D5649]">
                Kapcholyo, Kaplong, Sotik Constituency · +254 712 345 678
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#6D5649]">DELIVERY NOTE</div>
              <div className="font-mono font-bold text-base">{order.orderNumber}</div>
              <div className="text-xs text-[#6D5649]">{formatDateTime(order.createdAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-[#FCFBF7] p-4 rounded-xl border border-[#EFE8D5]">
            <div>
              <div className="text-xs text-[#6D5649]">Customer</div>
              <div className="font-semibold">{order.customerName}</div>
              <div className="font-mono text-xs mt-0.5">{order.phone}</div>
            </div>
            <div>
              <div className="text-xs text-[#6D5649]">Delivery Destination</div>
              <div className="font-semibold">{order.deliveryArea}</div>
              {order.deliveryNotes && (
                <div className="text-xs text-[#5D4B41] mt-0.5">{order.deliveryNotes}</div>
              )}
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E6DEC8] text-xs text-[#6D5649]">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">Unit</th>
                <th className="py-2 font-medium text-right">Qty</th>
                <th className="py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAD8]">
              {order.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-[#5D4B41]">{item.unit}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono tabular-nums">
                    {formatKes(item.priceKes * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-[#E6DEC8] pt-3 space-y-1 text-right">
            <div className="text-xs text-[#5D4B41]">
              Subtotal: <span className="font-mono tabular-nums">{formatKes(order.subtotalKes)}</span>
            </div>
            <div className="text-xs text-[#5D4B41]">
              Delivery: <span className="font-mono tabular-nums">{formatKes(order.deliveryFeeKes)}</span>
            </div>
            <div className="text-base font-bold">
              Total ({order.paymentMethod} · {order.paymentStatus}):{' '}
              <span className="font-mono tabular-nums text-[#2E7D32]">
                {formatKes(order.totalKes)}
              </span>
            </div>
            {order.mpesaReceipt && (
              <div className="text-xs font-mono text-[#2E7D32]">
                M-Pesa Receipt: {order.mpesaReceipt}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-dashed border-[#D8CEB8] grid grid-cols-2 gap-6 text-xs text-[#6D5649]">
            <div>
              <div className="mb-6">Dispatched by (Farm Rider):</div>
              <div className="border-b border-[#8D7B71]" />
            </div>
            <div>
              <div className="mb-6">Received in cold condition (Customer):</div>
              <div className="border-b border-[#8D7B71]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
