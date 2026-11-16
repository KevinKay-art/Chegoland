import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Trash2,
  Truck,
} from 'lucide-react';
import { api } from '../api/client.ts';
import { FarmImage } from '../components/FarmImage.tsx';
import { useAppContext } from '../hooks/useAppContext.tsx';
import {
  DELIVERY_AREAS,
  DELIVERY_FEE_KES,
  FREE_DELIVERY_THRESHOLD_KES,
} from '../i18n/translations.ts';
import { formatKes, isValidKenyanPhone } from '../utils/format.ts';

type MpesaStage = 'idle' | 'waiting' | 'failed';

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    language,
    t,
    hydratedCart,
    cartSubtotalKes,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    refreshProducts,
  } = useAppContext();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(DELIVERY_AREAS[0]);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa' | 'Cash on Delivery'>('M-Pesa');

  const [fieldErrors, setFieldErrors] = useState<{
    customerName?: string;
    phone?: string;
    deliveryArea?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // M-Pesa STK Push state
  const [mpesaStage, setMpesaStage] = useState<MpesaStage>('idle');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [mpesaErrorMsg, setMpesaErrorMsg] = useState<string | null>(null);
  const [pendingTotalKes, setPendingTotalKes] = useState<number>(0);

  const deliveryFeeKes =
    hydratedCart.length === 0
      ? 0
      : cartSubtotalKes >= FREE_DELIVERY_THRESHOLD_KES
      ? 0
      : DELIVERY_FEE_KES;
  const totalKes = cartSubtotalKes + deliveryFeeKes;

  // Poll M-Pesa STK Push status while waiting
  useEffect(() => {
    if (mpesaStage !== 'waiting' || !checkoutRequestId) return;

    const timer = setInterval(async () => {
      try {
        const res = await api.pollMpesaStatus(checkoutRequestId);
        if (res.status === 'SUCCESS') {
          clearInterval(timer);
          clearCart();
          await refreshProducts();
          navigate(`/order/${encodeURIComponent(res.orderNumber)}`);
        } else if (res.status === 'FAILED') {
          clearInterval(timer);
          setMpesaStage('failed');
          setMpesaErrorMsg(res.resultDesc);
          await refreshProducts();
        }
      } catch (err) {
        clearInterval(timer);
        setMpesaStage('failed');
        setMpesaErrorMsg(
          err instanceof Error ? err.message : 'Unable to confirm M-Pesa payment status.'
        );
      }
    }, 1100);

    return () => clearInterval(timer);
  }, [mpesaStage, checkoutRequestId, clearCart, refreshProducts, navigate]);

  function validateForm(): boolean {
    const errors: typeof fieldErrors = {};
    if (customerName.trim().length < 2) {
      errors.customerName = 'Please enter your full name (at least 2 characters).';
    }
    if (!isValidKenyanPhone(phone)) {
      errors.phone =
        'Enter a valid Kenyan phone number (e.g. 0712345678, 0110123456, or +254712345678).';
    }
    if (!deliveryArea.trim()) {
      errors.deliveryArea = 'Please select a delivery area.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCheckoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm() || hydratedCart.length === 0) return;

    setSubmitting(true);
    try {
      const response = await api.createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        deliveryArea: deliveryArea.trim(),
        deliveryNotes: deliveryNotes.trim(),
        items: hydratedCart.map((c) => ({
          productId: c.product.id,
          quantity: c.quantity,
        })),
        paymentMethod,
      });

      if (paymentMethod === 'M-Pesa' && response.mpesa) {
        setPendingOrderNumber(response.order.orderNumber);
        setPendingTotalKes(response.order.totalKes);
        setCheckoutRequestId(response.mpesa.checkoutRequestId);
        setMpesaErrorMsg(null);
        setMpesaStage('waiting');
      } else {
        clearCart();
        await refreshProducts();
        navigate(`/order/${encodeURIComponent(response.order.orderNumber)}`);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit your order.');
      await refreshProducts();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSimulateFailure() {
    if (!checkoutRequestId) return;
    try {
      const res = await api.simulateMpesaOutcome(checkoutRequestId, 'failed');
      setMpesaStage('failed');
      setMpesaErrorMsg(res.resultDesc);
      await refreshProducts();
    } catch (err) {
      setMpesaErrorMsg(err instanceof Error ? err.message : 'Simulation failed.');
    }
  }

  async function handleRetryMpesa() {
    if (!pendingOrderNumber) return;
    setMpesaErrorMsg(null);
    try {
      const res = await api.retryMpesaPayment(pendingOrderNumber, phone.trim());
      setCheckoutRequestId(res.mpesa.checkoutRequestId);
      setMpesaStage('waiting');
    } catch (err) {
      setMpesaErrorMsg(
        err instanceof Error ? err.message : 'Could not re-send M-Pesa STK Push.'
      );
    }
  }

  function handleSwitchToCod() {
    setMpesaStage('idle');
    setCheckoutRequestId(null);
    setPaymentMethod('Cash on Delivery');
  }

  // M-Pesa STK Push "Waiting / Failed" Screen
  if (mpesaStage !== 'idle') {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-14">
        <div className="bg-white rounded-2xl border border-[#E6DEC8] p-8 text-center shadow-sm">
          {mpesaStage === 'waiting' ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-5">
                <Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[#2C1E16]">
                {t.cart.waitingMpesaTitle}
              </h1>
              <p className="mt-3 text-sm text-[#5D4B41] leading-relaxed">
                {t.cart.waitingMpesaDesc}
              </p>

              <div className="mt-6 p-4 rounded-xl bg-[#FAF4E4] border border-[#E6DEC8] text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6D5649]">Order</span>
                  <span className="font-mono font-semibold text-[#2C1E16]">
                    {pendingOrderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D5649]">M-Pesa Number</span>
                  <span className="font-mono font-semibold text-[#2C1E16]">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D5649]">Amount</span>
                  <span className="font-mono font-bold text-[#2E7D32] tabular-nums">
                    {formatKes(pendingTotalKes)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[#EFE8D5]">
                <p className="text-xs text-[#6D5649] mb-3">
                  Sandbox STK Push confirmation arrives automatically in ~3 seconds.
                </p>
                <button
                  type="button"
                  onClick={() => void handleSimulateFailure()}
                  className="px-4 py-2 rounded-lg border border-[#FECACA] text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                >
                  {t.cart.simulateFailBtn}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FEF2F2] text-[#B91C1C] flex items-center justify-center mb-5">
                <AlertCircle className="w-8 h-8" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold text-[#2C1E16]">
                {t.cart.mpesaFailedTitle}
              </h1>
              <p className="mt-2.5 text-sm text-[#B91C1C]">
                {mpesaErrorMsg || 'The STK prompt timed out or was cancelled.'}
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => void handleRetryMpesa()}
                  className="px-5 py-2.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer"
                >
                  {t.cart.retryMpesaBtn}
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToCod}
                  className="px-5 py-2.5 rounded-lg border border-[#D8CEB8] bg-white hover:bg-[#F5EFE0] text-[#2C1E16] text-sm font-medium cursor-pointer"
                >
                  {t.cart.switchCodBtn}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (hydratedCart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-[#E6DEC8] p-10">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mb-4">
            <ShoppingBag className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#2C1E16]">
            {t.cart.emptyTitle}
          </h1>
          <p className="mt-2 text-sm text-[#5D4B41]">{t.cart.emptyDesc}</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-sm font-semibold"
          >
            {t.cart.browseShop}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#2C1E16]">
          {t.cart.checkoutTitle}
        </h1>
        <p className="mt-2 text-base text-[#5D4B41]">{t.cart.checkoutSub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Customer Form + Payment Selection */}
        <form
          onSubmit={(e) => void handleCheckoutSubmit(e)}
          className="lg:col-span-7 space-y-6"
          noValidate
        >
          <section className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
            <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.cart.customerDetails}
            </h2>

            <div>
              <label
                htmlFor="checkout-name"
                className="block text-sm font-medium text-[#3E2723] mb-1.5"
              >
                {t.cart.fullName}
              </label>
              <input
                id="checkout-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Wanjiku Mwangi"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
              />
              {fieldErrors.customerName && (
                <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.customerName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-phone"
                  className="block text-sm font-medium text-[#3E2723] mb-1.5"
                >
                  {t.cart.phoneLabel}
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] font-mono focus:outline-none focus:border-[#2E7D32]"
                />
                <p className="mt-1 text-xs text-[#6D5649]">{t.cart.phoneHint}</p>
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="checkout-area"
                  className="block text-sm font-medium text-[#3E2723] mb-1.5"
                >
                  {t.cart.areaLabel}
                </label>
                <select
                  id="checkout-area"
                  value={deliveryArea}
                  onChange={(e) => setDeliveryArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 min-h-[44px] rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
                >
                  {DELIVERY_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {fieldErrors.deliveryArea && (
                  <p className="mt-1 text-xs text-[#B91C1C]">{fieldErrors.deliveryArea}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="block text-sm font-medium text-[#3E2723] mb-1.5"
              >
                {t.cart.notesLabel}
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder={t.cart.notesPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8CEB8] bg-[#FCFBF7] text-sm text-[#2C1E16] focus:outline-none focus:border-[#2E7D32]"
              />
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-4">
            <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
              {t.cart.paymentTitle}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('M-Pesa')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  paymentMethod === 'M-Pesa'
                    ? 'border-[#2E7D32] bg-[#E8F5E9]/60'
                    : 'border-[#E6DEC8] bg-[#FCFBF7] hover:bg-[#FAF4E4]'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-[#2C1E16]">
                  <Smartphone className="w-4 h-4 text-[#2E7D32]" aria-hidden="true" />
                  <span>{t.cart.mpesaTitle}</span>
                </div>
                <p className="mt-1.5 text-xs text-[#5D4B41] leading-relaxed">
                  {t.cart.mpesaDesc}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-[#2E7D32] bg-[#E8F5E9]/60'
                    : 'border-[#E6DEC8] bg-[#FCFBF7] hover:bg-[#FAF4E4]'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-sm text-[#2C1E16]">
                  <Truck className="w-4 h-4 text-[#5D4037]" aria-hidden="true" />
                  <span>{t.cart.codTitle}</span>
                </div>
                <p className="mt-1.5 text-xs text-[#5D4B41] leading-relaxed">
                  {t.cart.codDesc}
                </p>
              </button>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#B91C1C]">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 text-white text-base font-semibold transition-colors cursor-pointer"
            >
              {submitting
                ? t.cart.submitting
                : paymentMethod === 'M-Pesa'
                ? `${t.cart.placeOrderMpesa} · ${formatKes(totalKes)}`
                : `${t.cart.placeOrderCod} · ${formatKes(totalKes)}`}
            </button>
          </section>
        </form>

        {/* Right: Editable Basket Summary */}
        <aside className="lg:col-span-5 bg-white rounded-xl border border-[#E6DEC8] p-6 space-y-5">
          <h2 className="font-display text-xl font-semibold text-[#2C1E16]">
            {t.cart.title}
          </h2>

          <div className="divide-y divide-[#F0EAD8]">
            {hydratedCart.map(({ product, quantity, lineTotalKes }) => {
              const name = language === 'sw' ? product.nameSw : product.name;
              return (
                <div key={product.id} className="py-4 first:pt-0 flex gap-3.5">
                  <FarmImage
                    src={product.image}
                    alt={name}
                    className="w-16 h-14 rounded-lg object-cover border border-[#E6DEC8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-[#2C1E16]">{name}</h3>
                        <p className="text-xs text-[#6D5649]">
                          {product.unit} · {formatKes(product.priceKes)} · {product.stock} in stock
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
                      <div className="inline-flex items-center border border-[#D8CEB8] rounded-lg">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F5EFE0] rounded-l-lg cursor-pointer"
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
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F5EFE0] disabled:opacity-40 rounded-r-lg cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold font-mono tabular-nums text-[#2C1E16]">
                        {formatKes(lineTotalKes)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E6DEC8] space-y-2 text-sm">
            <div className="flex justify-between text-[#5D4B41]">
              <span>{t.cart.subtotal}</span>
              <span className="font-mono tabular-nums">{formatKes(cartSubtotalKes)}</span>
            </div>
            <div className="flex justify-between text-[#5D4B41]">
              <span>{t.cart.deliveryFee}</span>
              <span className="font-mono tabular-nums">
                {deliveryFeeKes === 0 ? 'KES 0' : formatKes(deliveryFeeKes)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-[#2C1E16] pt-3 border-t border-[#E6DEC8]">
              <span>{t.cart.total}</span>
              <span className="font-mono tabular-nums text-[#2E7D32]">
                {formatKes(totalKes)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
