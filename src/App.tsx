import React, { useCallback, useEffect, useState } from 'react';
import { CharacterEngineProvider, useCharacterEngine } from './context/CharacterEngine';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShopSection } from './components/ShopSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { SectionScrollArrows } from './components/SectionScrollArrows';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import type { CartItem, Product, ProductCategory, SectionId } from './types/shop';

const CART_STORAGE_KEY = 'scholarpack_cart_v1';

const StorefrontShell: React.FC = () => {
  const { activeSection, setActiveSection, reducedMotion } = useCharacterEngine();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage errors
    }
  }, [cartItems]);

  // Track visible section cleanly as visitor scrolls
  useEffect(() => {
    const sections: SectionId[] = ['home', 'shop', 'contact'];
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestSection: SectionId | null = null;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestSection = entry.target.id as SectionId;
          }
        }
        if (bestSection) {
          setActiveSection(bestSection);
        }
      },
      {
        rootMargin: '-18% 0px -35% 0px',
        threshold: [0.15, 0.35, 0.6],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [setActiveSection]);

  const scrollToSection = useCallback(
    (section: SectionId) => {
      setActiveSection(section);
      if (section === 'home') {
        window.scrollTo({
          top: 0,
          behavior: reducedMotion ? 'auto' : 'smooth',
        });
        return;
      }
      const target = document.getElementById(section);
      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    },
    [reducedMotion, setActiveSection]
  );

  const handleAddToCart = useCallback(
    (product: Product, variant?: string, quantity = 1) => {
      setCartItems((prev) => {
        const idx = prev.findIndex(
          (entry) => entry.product.id === product.id && entry.variant === variant
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: Math.min(99, updated[idx].quantity + quantity),
          };
          return updated;
        }
        return [...prev, { product, variant, quantity }];
      });
    },
    []
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, variant: string | undefined, delta: number) => {
      setCartItems((prev) =>
        prev
          .map((entry) => {
            if (entry.product.id === productId && entry.variant === variant) {
              const nextQty = entry.quantity + delta;
              return nextQty > 0 ? { ...entry, quantity: nextQty } : null;
            }
            return entry;
          })
          .filter((entry): entry is CartItem => entry !== null)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((productId: string, variant: string | undefined) => {
    setCartItems((prev) =>
      prev.filter((entry) => !(entry.product.id === productId && entry.variant === variant))
    );
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar
        activeSection={activeSection}
        onNavigate={scrollToSection}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main>
        <HeroSection onGoToShop={() => scrollToSection('shop')} />
        <ShopSection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddToCart={handleAddToCart}
          onViewDetails={(product) => setModalProduct(product)}
        />
        <ContactSection />
      </main>

      <Footer onNavigate={scrollToSection} onSelectCategory={setSelectedCategory} />

      <SectionScrollArrows activeSection={activeSection} onNavigate={scrollToSection} />

      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
};

export default function App() {
  return (
    <CharacterEngineProvider>
      <StorefrontShell />
    </CharacterEngineProvider>
  );
}
