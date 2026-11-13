import React, { useEffect, useState } from 'react';
import { Check, Minus, Plus, X } from 'lucide-react';
import type { Product } from '../types/shop';
import { ProductArtwork } from './ProductArtwork';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: string, quantity?: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0]);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, product]);

  if (!product) return null;

  const handleConfirmAdd = () => {
    onAddToCart(product, selectedVariant, quantity);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto rounded-3xl border border-border-hairline bg-surface shadow-2xl md:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-xl border border-border-hairline bg-surface/90 text-ink transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Left Artwork */}
        <div className="aspect-[4/3] w-full border-b border-border-hairline md:col-span-5 md:aspect-auto md:border-b-0 md:border-r">
          <ProductArtwork artworkId={product.artworkId} accentHex={product.accentHex} />
        </div>

        {/* Right Purchase Details */}
        <div className="flex flex-col p-6 sm:p-8 md:col-span-7">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="font-semibold uppercase tracking-wider">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
          </div>

          <h3
            id="modal-product-title"
            className="font-display mt-2 text-2xl font-bold text-ink"
          >
            {product.name}
          </h3>

          <p className="tabular-nums mt-2 text-xl font-bold text-accent">
            ${product.price.toFixed(2)}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            {product.fullDescription}
          </p>

          <ul className="mt-4 space-y-2 border-t border-border-hairline pt-4">
            {product.highlights.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-ink">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          {product.variants && product.variants.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Option / Size
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const active = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`h-9 rounded-lg px-3 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-accent text-white'
                          : 'border border-border-hairline bg-canvas text-ink hover:border-accent/40'
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex h-11 items-center rounded-xl border border-border-hairline bg-canvas px-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface"
              >
                <Minus className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="tabular-nums w-8 text-center text-sm font-semibold text-ink">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleConfirmAdd}
              className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover whitespace-nowrap shrink-0"
            >
              Add to Cart · ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
