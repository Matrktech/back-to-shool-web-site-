import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { SectionId } from '../types/shop';

interface SectionScrollArrowsProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

const SECTION_ORDER: SectionId[] = ['home', 'shop', 'contact'];

export const SectionScrollArrows: React.FC<SectionScrollArrowsProps> = ({
  activeSection,
  onNavigate,
}) => {
  const currentIndex = SECTION_ORDER.indexOf(activeSection);

  // UP: scrolls smoothly to previous section; when already at top (home), returns to home top
  const handleUp = () => {
    if (currentIndex <= 0) {
      onNavigate('home');
      return;
    }
    onNavigate(SECTION_ORDER[currentIndex - 1]);
  };

  // DOWN: Home -> Shop -> Contact Us -> returns to Home
  const handleDown = () => {
    if (currentIndex >= SECTION_ORDER.length - 1) {
      onNavigate('home');
      return;
    }
    onNavigate(SECTION_ORDER[currentIndex + 1]);
  };

  const upLabel =
    activeSection === 'home'
      ? 'Return to top of Home'
      : activeSection === 'shop'
        ? 'Scroll up to Home'
        : 'Scroll up to Shop';

  const downLabel =
    activeSection === 'home'
      ? 'Scroll down to Shop'
      : activeSection === 'shop'
        ? 'Scroll down to Contact Us'
        : 'Return to Home';

  return (
    <div
      aria-label="Section scroll controls"
      className="fixed bottom-4 right-4 z-30 flex flex-col items-center gap-1.5 rounded-2xl border border-border-hairline bg-surface/92 p-1.5 shadow-lg backdrop-blur-md sm:bottom-6 sm:right-6"
    >
      <button
        type="button"
        onClick={handleUp}
        title={upLabel}
        aria-label={upLabel}
        className="group flex h-11 w-11 items-center justify-center rounded-xl text-ink transition-all duration-200 hover:bg-accent hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowUp
          className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </button>

      <span className="tabular-nums select-none text-[11px] font-semibold tracking-wider text-ink-muted">
        0{currentIndex + 1}/03
      </span>

      <button
        type="button"
        onClick={handleDown}
        title={downLabel}
        aria-label={downLabel}
        className="group flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent transition-all duration-200 hover:bg-accent hover:text-white active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <ArrowDown
          className="h-5 w-5 transition-transform duration-200 group-hover:translate-y-0.5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
