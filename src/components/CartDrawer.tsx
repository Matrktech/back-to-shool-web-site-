import React, { useEffect, useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, PaymentMethod } from '../types/shop';
import { ProductArtwork } from './ProductArtwork';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, variant: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, variant: string | undefined) => void;
  onClearCart: () => void;
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'mtn_momo', label: 'MTN Mobile Money' },
  { id: 'airtel_money', label: 'Airtel Money' },
  { id: 'card', label: 'Debit / Credit Card' },
  { id: 'cash_on_delivery', label: 'Cash on Delivery' },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({
  open,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderReference: string;
    total: number;
    notice: string;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, open]);

  if (!open) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 75 ? 0 : 6.5;
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paymentMethod,
          items: items.map((entry) => ({
            id: entry.product.id,
            name: entry.product.name,
            quantity: entry.quantity,
            price: entry.product.price,
            variant: entry.variant,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setCheckoutError(data.error || 'Could not create order reservation.');
        return;
      }

      setOrderConfirmation({
        orderReference: data.order.orderReference,
        total: data.order.total,
        notice: data.gatewayReadyNotice,
      });
      onClearCart();
    } catch {
      setCheckoutError('Network error while connecting to checkout service.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col border-l border-border-hairline bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-hairline px-6 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-accent" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-ink">Your School Bag</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {orderConfirmation ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <h3 className="font-display text-base font-bold">
                  Order Reservation #{orderConfirmation.orderReference}
                </h3>
              </div>
              <p className="mt-2 text-sm text-emerald-900">
                Total reserved:{' '}
                <span className="tabular-nums font-bold">
                  ${orderConfirmation.total.toFixed(2)}
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800">
                {orderConfirmation.notice}
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrderConfirmation(null);
                  onClose();
                }}
                className="mt-4 inline-flex h-10 items-center rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white hover:bg-emerald-800"
              >
                Continue Shopping
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-ink-muted">
                <ShoppingBag className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display mt-4 text-base font-bold text-ink">
                Your school bag is empty
              </h3>
              <p className="mt-1.5 max-w-xs text-sm text-ink-muted">
                Add backpacks, notebooks, uniforms, or stationery from the shop section to get
                started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.variant ?? 'default'}`}
                  className="flex gap-3.5 rounded-2xl border border-border-hairline bg-canvas p-3"
                >
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-border-hairline">
                    <ProductArtwork
                      artworkId={item.product.artworkId}
                      accentHex={item.product.accentHex}
                    />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold leading-snug text-ink">
                          {item.product.name}
                        </h3>
                        {item.variant && (
                          <p className="mt-0.5 text-xs text-ink-muted">{item.variant}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id, item.variant)}
                        aria-label={`Remove ${item.product.name}`}
                        className="rounded-md p-1 text-ink-muted hover:bg-surface hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex h-8 items-center rounded-lg border border-border-hairline bg-surface">
                        <button
                          type="button"
                          aria-label="Decrease item quantity"
                          onClick={() => onUpdateQuantity(item.product.id, item.variant, -1)}
                          className="flex h-8 w-8 items-center justify-center text-ink hover:bg-surface-muted"
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <span className="tabular-nums w-7 text-center text-xs font-semibold text-ink">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase item quantity"
                          onClick={() => onUpdateQuantity(item.product.id, item.variant, 1)}
                          className="flex h-8 w-8 items-center justify-center text-ink hover:bg-surface-muted"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>

                      <span className="tabular-nums text-sm font-bold text-ink">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Reservation Form */}
        {items.length > 0 && !orderConfirmation && (
          <form
            onSubmit={handleCheckoutSubmit}
            className="border-t border-border-hairline bg-canvas p-6 space-y-4"
          >
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-ink-muted">
                <span>Subtotal</span>
                <span className="tabular-nums font-medium text-ink">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ink-muted">
                <span>Delivery (Free over $75)</span>
                <span className="tabular-nums font-medium text-ink">
                  {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border-hairline pt-2 text-base font-bold text-ink">
                <span>Total</span>
                <span className="tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Parent / Student Name"
                aria-label="Parent or student name"
                className="h-10 rounded-xl border border-border-hairline bg-surface px-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Mobile Money / Phone"
                aria-label="Mobile money or phone number"
                className="h-10 rounded-xl border border-border-hairline bg-surface px-3 text-xs text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="payment-method-select"
                className="block text-xs font-medium text-ink-muted mb-1"
              >
                Preferred Payment Channel
              </label>
              <select
                id="payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="h-10 w-full rounded-xl border border-border-hairline bg-surface px-3 text-xs font-medium text-ink focus:border-accent focus:outline-none"
              >
                {PAYMENT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {checkoutError && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {checkoutError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {submitting ? 'Reserving Order...' : `Reserve Order · $${total.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
