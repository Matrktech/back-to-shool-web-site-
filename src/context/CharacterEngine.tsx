import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { CharacterBehavior, SectionId } from '../types/shop';

export interface VideoSegment {
  start: number;
  end: number;
  loopMode: 'forward' | 'pingpong' | 'hold_end';
  playbackRate: number;
}

export const CHARACTER_SEGMENTS: Record<CharacterBehavior, VideoSegment> = {
  // 0.00 - 1.15s: Welcoming pose facing left toward hero copy, open friendly hand gesture
  greeting_idle: { start: 0.04, end: 1.08, loopMode: 'pingpong', playbackRate: 0.9 },
  // 0.55 - 1.75s: Turns slightly to notice visitor and leans toward the bag
  notice_visitor: { start: 0.45, end: 1.65, loopMode: 'pingpong', playbackRate: 1.0 },
  // 1.75 - 3.55s: Looks inside the purple backpack, inspecting supplies
  inspect_bag: { start: 1.75, end: 3.5, loopMode: 'pingpong', playbackRate: 0.95 },
  // 3.55 - 5.60s: Pulls out the colorful ruler, shows it off, tucks it back
  showcase_supply: { start: 3.55, end: 5.55, loopMode: 'forward', playbackRate: 1.05 },
  // 5.60 - 7.80s: Holds backpack handles and steps cheerfully across
  pack_stride: { start: 5.6, end: 7.75, loopMode: 'forward', playbackRate: 1.05 },
  // 7.80 - 9.90s: Relaxed proud pose with warm wave beside the bag
  relaxed_wave: { start: 7.8, end: 9.85, loopMode: 'pingpong', playbackRate: 0.85 },
};

export interface PointerState {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (top) to 1 (bottom)
  isHoveringCharacter: boolean;
  isNearCharacter: boolean;
}

interface CharacterEngineContextValue {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  posterImage: HTMLImageElement | null;
  videoReady: boolean;
  posterReady: boolean;
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  behavior: CharacterBehavior;
  reactionLabel: string | null;
  triggerReaction: (
    nextBehavior: CharacterBehavior,
    durationMs?: number,
    label?: string
  ) => void;
  pointerRef: React.MutableRefObject<PointerState>;
  setHoveringCharacter: (hovering: boolean) => void;
  setNearCharacter: (near: boolean) => void;
  reducedMotion: boolean;
  isLowPower: boolean;
}

const CharacterEngineContext = createContext<CharacterEngineContextValue | null>(null);

const OPTIMIZED_VIDEO_SRC = '/assets/aistudio/character-optimized.mp4';
const FALLBACK_VIDEO_SRC = '/assets/aistudio/gemini_generated_video_76676d15_9d476354.mp4';
const POSTER_SRC = '/assets/aistudio/character-poster.jpg';

function sectionDefaultBehavior(section: SectionId): CharacterBehavior {
  switch (section) {
    case 'shop':
      return 'inspect_bag';
    case 'contact':
      return 'relaxed_wave';
    case 'home':
    default:
      return 'greeting_idle';
  }
}

export const CharacterEngineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>(OPTIMIZED_VIDEO_SRC);
  const [videoReady, setVideoReady] = useState(false);
  const [posterReady, setPosterReady] = useState(false);
  const [posterImage, setPosterImage] = useState<HTMLImageElement | null>(null);

  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [overrideBehavior, setOverrideBehavior] = useState<CharacterBehavior | null>(null);
  const [reactionLabel, setReactionLabel] = useState<string | null>(null);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [isLowPower, setIsLowPower] = useState(false);

  const reactionTimerRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);
  const lastStepTimeRef = useRef<number>(0);

  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    isHoveringCharacter: false,
    isNearCharacter: false,
  });

  // Detect reduced motion & device capability
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);

    const cores = navigator.hardwareConcurrency ?? 8;
    const narrow = window.innerWidth < 768;
    setIsLowPower(cores <= 4 || narrow);

    const handleResize = () => {
      setIsLowPower((navigator.hardwareConcurrency ?? 8) <= 4 || window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      mq.removeEventListener('change', updateMotion);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load poster texture once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = POSTER_SRC;
    img.onload = () => {
      setPosterImage(img);
      setPosterReady(true);
    };
  }, []);

  // Global mouse tracking (normalized -1..1)
  useEffect(() => {
    if (reducedMotion) return;
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (e.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion]);

  const behavior: CharacterBehavior = overrideBehavior ?? sectionDefaultBehavior(activeSection);

  const triggerReaction = useCallback(
    (nextBehavior: CharacterBehavior, durationMs = 2100, label?: string) => {
      if (reactionTimerRef.current !== null) {
        window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
      }
      setOverrideBehavior(nextBehavior);
      setReactionLabel(label ?? null);

      const video = videoRef.current;
      const seg = CHARACTER_SEGMENTS[nextBehavior];
      if (video && video.readyState >= 1) {
        directionRef.current = 1;
        video.currentTime = seg.start;
        if (!reducedMotion) {
          video.playbackRate = seg.playbackRate;
          video.play().catch(() => {});
        }
      }

      if (durationMs > 0) {
        reactionTimerRef.current = window.setTimeout(() => {
          setOverrideBehavior(null);
          setReactionLabel(null);
          reactionTimerRef.current = null;
        }, durationMs);
      }
    },
    [reducedMotion]
  );

  const setHoveringCharacter = useCallback(
    (hovering: boolean) => {
      pointerRef.current.isHoveringCharacter = hovering;
      if (hovering && !reducedMotion) {
        if (!overrideBehavior) {
          if (activeSection === 'shop') {
            triggerReaction('showcase_supply', 2400);
          } else if (activeSection === 'home') {
            triggerReaction('notice_visitor', 1800);
          }
        }
      }
    },
    [activeSection, overrideBehavior, reducedMotion, triggerReaction]
  );

  const setNearCharacter = useCallback(
    (near: boolean) => {
      const wasNear = pointerRef.current.isNearCharacter;
      pointerRef.current.isNearCharacter = near;
      if (near && !wasNear && !reducedMotion && !overrideBehavior && activeSection === 'home') {
        triggerReaction('notice_visitor', 1600);
      }
    },
    [activeSection, overrideBehavior, reducedMotion, triggerReaction]
  );

  // Manage single HTML5 video segment loop cleanly without jitter
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seg = CHARACTER_SEGMENTS[behavior];
    directionRef.current = 1;

    if (reducedMotion) {
      video.pause();
      if (video.readyState >= 1 && Math.abs(video.currentTime - seg.start) > 0.1) {
        video.currentTime = seg.start;
      }
      return;
    }

    if (video.readyState >= 1) {
      if (video.currentTime < seg.start - 0.15 || video.currentTime > seg.end + 0.15) {
        video.currentTime = seg.start;
      }
      video.playbackRate = seg.playbackRate;
      video.play().catch(() => {});
    }

    let rafId = 0;
    const step = (now: number) => {
      if (video.readyState >= 2) {
        const current = video.currentTime;

        if (seg.loopMode === 'forward') {
          if (video.paused) {
            video.playbackRate = seg.playbackRate;
            video.play().catch(() => {});
          }
          if (current >= seg.end && !video.seeking) {
            video.currentTime = seg.start;
          }
        } else if (seg.loopMode === 'pingpong') {
          if (directionRef.current === 1) {
            if (video.paused) {
              video.playbackRate = seg.playbackRate;
              video.play().catch(() => {});
            }
            if (current >= seg.end) {
              directionRef.current = -1;
              video.pause();
              lastStepTimeRef.current = now;
            }
          } else {
            // Smooth reverse step at ~24fps using fast-seek keyframes
            const dt = (now - lastStepTimeRef.current) / 1000;
            if (dt >= 1 / 24 && !video.seeking) {
              lastStepTimeRef.current = now;
              const nextTime = current - dt * seg.playbackRate;
              if (nextTime <= seg.start) {
                directionRef.current = 1;
                video.currentTime = seg.start;
                video.playbackRate = seg.playbackRate;
                video.play().catch(() => {});
              } else {
                video.currentTime = nextTime;
              }
            }
          }
        } else if (seg.loopMode === 'hold_end') {
          if (current >= seg.end) {
            video.pause();
          }
        }
      }
      rafId = window.requestAnimationFrame(step);
    };

    rafId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(rafId);
  }, [behavior, reducedMotion, videoReady]);

  const value = useMemo<CharacterEngineContextValue>(
    () => ({
      videoRef,
      posterImage,
      videoReady,
      posterReady,
      activeSection,
      setActiveSection,
      behavior,
      reactionLabel,
      triggerReaction,
      pointerRef,
      setHoveringCharacter,
      setNearCharacter,
      reducedMotion,
      isLowPower,
    }),
    [
      activeSection,
      behavior,
      isLowPower,
      posterImage,
      posterReady,
      reactionLabel,
      reducedMotion,
      setHoveringCharacter,
      setNearCharacter,
      triggerReaction,
      videoReady,
    ]
  );

  return (
    <CharacterEngineContext.Provider value={value}>
      {/* Single shared video element loaded once for the entire page */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={POSTER_SRC}
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        aria-hidden="true"
        className="pointer-events-none fixed -left-[9999px] -top-[9999px] h-px w-px opacity-0"
        onLoadedData={() => {
          setVideoReady(true);
          const v = videoRef.current;
          if (v && !reducedMotion) {
            v.currentTime = CHARACTER_SEGMENTS[behavior].start;
            v.play().catch(() => {});
          }
        }}
        onError={() => {
          if (videoSrc !== FALLBACK_VIDEO_SRC) {
            setVideoSrc(FALLBACK_VIDEO_SRC);
          }
        }}
      />
      {children}
    </CharacterEngineContext.Provider>
  );
};

export function useCharacterEngine() {
  const ctx = useContext(CharacterEngineContext);
  if (!ctx) {
    throw new Error('useCharacterEngine must be used inside CharacterEngineProvider');
  }
  return ctx;
}
