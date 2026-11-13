import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { InteractiveCharacter } from './InteractiveCharacter';
import { useCharacterEngine } from '../context/CharacterEngine';

interface HeroSectionProps {
  onGoToShop: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGoToShop }) => {
  const { triggerReaction, reducedMotion } = useCharacterEngine();
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.from(leftColRef.current?.children ?? [], {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
      gsap.from(rightColRef.current, {
        scale: 0.96,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    });
    return () => ctx.revert();
  }, [reducedMotion]);

  const handleExploreClick = () => {
    triggerReaction('showcase_supply', 2100, 'Let us pack up!');
    onGoToShop();
  };

  const handleShopNowClick = () => {
    triggerReaction('pack_stride', 2200, 'Heading to the shop!');
    // Brief visible reaction before smooth scroll transition
    window.setTimeout(() => {
      onGoToShop();
    }, 380);
  };

  return (
    <section
      id="home"
      aria-labelledby="hero-heading"
      className="relative overflow-hidden border-b border-border-hairline bg-canvas bg-notebook-grid"
    >
      {/* Subtle architectural geometric accents kept strictly out of the text path */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-12 h-80 w-80 rounded-full bg-accent-soft/60 blur-3xl"
      />

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
        {/* LEFT SIDE: Typography + Primary & Secondary CTAs */}
        <div ref={leftColRef} className="relative z-10 flex flex-col items-start lg:col-span-6">
          <p className="mb-4 text-sm font-semibold tracking-wide text-accent">
            New School Term Collection
          </p>

          <h1
            id="hero-heading"
            className="font-display max-w-xl text-balance font-extrabold tracking-tight text-ink"
            style={{ fontSize: 'clamp(2.35rem, 4.3vw, 3.85rem)', lineHeight: 1.06 }}
          >
            BACK TO SCHOOL, BACK TO GREATNESS!
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg">
            Start every morning confident and organized. Discover ergonomic backpacks, crisp
            exercise books, precision math sets, tailored uniforms, and lunch gear built for a
            bright term ahead.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={handleExploreClick}
              className="inline-flex h-12 items-center gap-2.5 rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <span>EXPLORE SCHOOL ESSENTIALS</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleShopNowClick}
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border-hairline bg-surface px-6 text-sm font-semibold text-ink transition-all duration-200 hover:border-accent/60 hover:bg-accent-soft/35 active:scale-[0.98] whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <ShoppingBag className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>SHOP NOW</span>
            </button>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink-muted">
            <span>Ergonomic Backpacks</span>
            <span aria-hidden="true">·</span>
            <span>Uniforms &amp; Footwear</span>
            <span aria-hidden="true">·</span>
            <span>Stationery &amp; Lunch Gear</span>
          </div>
        </div>

        {/* RIGHT SIDE: Dominant Interactive Cartoon Schoolbag Character */}
        <div
          ref={rightColRef}
          className="relative flex w-full items-center justify-center lg:col-span-6"
        >
          <div className="relative w-full max-w-[580px] rounded-3xl border border-border-hairline bg-surface/85 p-3 shadow-[0_24px_60px_-24px_rgba(24,22,34,0.12)] sm:p-5">
            {/* Subtle school-themed notebook margin & corner ruler decoration */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 rounded-2xl bg-ruled-lines opacity-75"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 text-xs font-medium text-ink-muted/75"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warm-amber/70" />
              <span>Move cursor or click character</span>
            </div>

            <InteractiveCharacter variant="hero" className="relative z-10 w-full pt-4" />
          </div>
        </div>
      </div>
    </section>
  );
};
