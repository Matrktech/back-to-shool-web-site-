import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { SectionId } from '../types/shop';

interface NavbarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  cartCount: number;
  onOpenCart: () => void;
}

const NAV_ITEMS: { id: SectionId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'contact', label: 'Contact Us' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  cartCount,
  onOpenCart,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
          className="font-display text-xl font-bold tracking-tight text-ink whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md px-1"
        >
          ScholarPack
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav aria-label="Primary navigation" className="flex items-center gap-4 sm:gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm ${
                  isActive ? 'text-accent' : 'text-ink-muted hover:text-ink'
                }`}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 bottom-0.5 h-0.5 rounded-full bg-accent transition-transform duration-200 origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action — Cart button with quantity */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Open shopping bag, ${cartCount} items`}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-hairline bg-surface px-3.5 text-sm font-semibold text-ink shadow-xs transition-all duration-150 hover:border-accent/50 hover:bg-accent-soft/40 active:scale-[0.98] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ShoppingBag className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="hidden sm:inline">Cart</span>
            <span className="tabular-nums inline-flex min-w-5 items-center justify-center rounded-md bg-accent px-1.5 py-0.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
