import React, { useMemo, useState } from 'react';
import { Eye, Plus, Search, X } from 'lucide-react';
import { PRODUCTS, PRODUCT_CATEGORIES } from '../data/products';
import type { Product, ProductCategory } from '../types/shop';
import { ProductArtwork } from './ProductArtwork';
import { InteractiveCharacter } from './InteractiveCharacter';
import { useCharacterEngine } from '../context/CharacterEngine';

interface ShopSectionProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  onAddToCart: (product: Product, variant?: string, quantity?: number) => void;
  onViewDetails: (product: Product) => void;
}

export const ShopSection: React.FC<ShopSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onViewDetails,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const { triggerReaction } = useCharacterEngine();

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return PRODUCTS.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.shortDescription.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleCardQuickAdd = (product: Product) => {
    const defaultVariant = product.variants?.[0];
    onAddToCart(product, defaultVariant, 1);
    triggerReaction('showcase_supply', 2200, `Added ${product.name.split(' ')[0]}!`);
    setRecentlyAddedId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedId((prev) => (prev === product.id ? null : prev));
    }, 1100);
  };

  const handleOpenProduct = (product: Product) => {
    triggerReaction('inspect_bag', 1900);
    onViewDetails(product);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    onSelectCategory('All');
  };

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="border-b border-border-hairline bg-surface py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header + Interactive Shopping Companion */}
        <div className="grid grid-cols-1 items-center gap-8 border-b border-border-hairline pb-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-accent">Curated School Catalog</p>
            <h2
              id="shop-heading"
              className="font-display mt-2 text-balance font-bold tracking-tight text-ink"
              style={{ fontSize: 'clamp(1.85rem, 3.2vw, 2.75rem)', lineHeight: 1.12 }}
            >
              EVERYTHING YOU NEED FOR A GREAT SCHOOL YEAR
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
              Build your complete term checklist in one place—from sturdy backpacks and ruled
              notebooks to geometry sets, crisp uniforms, footwear, and lunch essentials.
            </p>
          </div>

          <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
            <div className="w-full max-w-[300px] rounded-2xl border border-border-hairline bg-canvas p-3">
              <InteractiveCharacter variant="companion" className="w-full" />
            </div>
          </div>
        </div>

        {/* Search Bar + Category Filter Bar */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search backpacks, math sets, uniforms, bottles..."
                aria-label="Search school products"
                className="h-11 w-full rounded-xl border border-border-hairline bg-canvas pl-10 pr-10 text-sm text-ink placeholder:text-ink-muted/75 transition-colors focus:border-accent focus:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted hover:bg-surface-muted hover:text-ink"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <p className="tabular-nums text-sm text-ink-muted">
              Showing <span className="font-semibold text-ink">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Interactive Category Filter Controls */}
          <div
            role="tablist"
            aria-label="Filter products by category"
            className="flex flex-wrap items-center gap-2"
          >
            {PRODUCT_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    onSelectCategory(category);
                    triggerReaction('inspect_bag', 1500);
                  }}
                  className={`h-9 rounded-lg px-3.5 text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? 'bg-accent text-white shadow-xs'
                      : 'border border-border-hairline bg-canvas text-ink-muted hover:border-accent/40 hover:text-ink'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border-hairline bg-canvas px-6 py-14 text-center">
            <h3 className="font-display text-lg font-bold text-ink">
              No school essentials matched your search
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              Try searching for a broader keyword or reset the category filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const isJustAdded = recentlyAddedId === product.id;
              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border-hairline bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_14px_30px_-14px_rgba(24,22,34,0.12)]"
                >
                  {/* Studio Product Artwork */}
                  <button
                    type="button"
                    onClick={() => handleOpenProduct(product)}
                    aria-label={`View details for ${product.name}`}
                    className="relative aspect-[4/3] w-full overflow-hidden border-b border-border-hairline text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  >
                    <ProductArtwork
                      artworkId={product.artworkId}
                      accentHex={product.accentHex}
                      className="transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>

                  {/* Product Card Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-ink-muted">
                      <span className="font-medium uppercase tracking-wider">
                        {product.category}
                      </span>
                      <span className="tabular-nums font-semibold text-ink">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="font-display mt-2 text-lg font-bold leading-snug text-ink">
                      <button
                        type="button"
                        onClick={() => handleOpenProduct(product)}
                        className="text-left transition-colors hover:text-accent focus:outline-none focus-visible:underline"
                      >
                        {product.name}
                      </button>
                    </h3>

                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">
                      {product.shortDescription}
                    </p>

                    <div className="mt-5 flex items-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCardQuickAdd(product)}
                        className={`inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold transition-all duration-150 active:scale-[0.98] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isJustAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-accent text-white hover:bg-accent-hover'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{isJustAdded ? 'Added to Cart' : 'Add to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenProduct(product)}
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border-hairline bg-canvas px-3.5 text-xs font-semibold text-ink transition-colors hover:border-accent/50 hover:bg-accent-soft/35 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Eye className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
