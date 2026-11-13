import React from 'react';
import { PRODUCT_CATEGORIES } from '../data/products';
import type { ProductCategory, SectionId } from '../types/shop';

interface FooterProps {
  onNavigate: (section: SectionId) => void;
  onSelectCategory: (category: ProductCategory) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const categories = PRODUCT_CATEGORIES.filter((cat) => cat !== 'All');

  const handleCategoryJump = (category: ProductCategory) => {
    onSelectCategory(category);
    onNavigate('shop');
  };

  return (
    <footer className="border-t border-border-hairline bg-surface text-ink">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Summary */}
          <div className="lg:col-span-4">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('home');
              }}
              className="font-display text-xl font-bold tracking-tight text-ink"
            >
              ScholarPack
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              A bright, dependable Back to School storefront bringing durable backpacks,
              notebooks, math sets, uniforms, and lunch essentials together for every new term.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Quick Links</h3>
            <ul className="mt-3.5 space-y-2.5 text-sm text-ink-muted">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('home');
                  }}
                  className="transition-colors hover:text-accent"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#shop"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('shop');
                  }}
                  className="transition-colors hover:text-accent"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('contact');
                  }}
                  className="transition-colors hover:text-accent"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
              Product Categories
            </h3>
            <ul className="mt-3.5 grid grid-cols-1 gap-2 text-sm text-ink-muted">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    type="button"
                    onClick={() => handleCategoryJump(category)}
                    className="text-left transition-colors hover:text-accent"
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info & Socials */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink">Contact</h3>
            <ul className="mt-3.5 space-y-2.5 text-sm text-ink-muted">
              <li>+256 700 123 456</li>
              <li>hello@scholarpack.store</li>
              <li>Plot 24 Learning Avenue, Shop 3</li>
              <li className="flex items-center gap-3 pt-1">
                <a
                  href="https://wa.me/256700123456"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-accent hover:underline"
                >
                  WhatsApp
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  Instagram
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-ink hover:underline"
                >
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border-hairline pt-6 text-xs text-ink-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} ScholarPack. All rights reserved.</p>
          <p>Back to School Essentials · Storefront &amp; Bulk Term Support</p>
        </div>
      </div>
    </footer>
  );
};
