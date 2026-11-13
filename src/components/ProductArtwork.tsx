import React from 'react';
import type { Product } from '../types/shop';

interface ProductArtworkProps {
  artworkId: Product['artworkId'];
  accentHex: string;
  className?: string;
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  artworkId,
  accentHex,
  className = '',
}) => {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-muted ${className}`}
    >
      {/* Subtle studio tabletop horizon line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] border-t border-border-hairline/70 bg-gradient-to-b from-white/40 to-white/75"
      />

      <svg
        viewBox="0 0 280 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 h-[84%] w-[84%] drop-shadow-[0_12px_16px_rgba(24,22,34,0.09)]"
        aria-hidden="true"
      >
        {artworkId === 'violet-backpack' && (
          <g>
            {/* Top carry loop */}
            <path d="M118 44C118 28 162 28 162 44" stroke="#4C1D95" strokeWidth="10" strokeLinecap="round" />
            {/* Side water pocket */}
            <rect x="66" y="106" width="20" height="52" rx="10" fill="#5B21B6" />
            <rect x="194" y="106" width="20" height="52" rx="10" fill="#5B21B6" />
            {/* Main backpack shell */}
            <rect x="78" y="42" width="124" height="138" rx="34" fill="#7C3AED" />
            <rect x="84" y="48" width="112" height="126" rx="28" fill="#8B5CF6" />
            {/* Top zipper seam */}
            <path d="M90 88C116 78 164 78 190 88" stroke="#4C1D95" strokeWidth="4" strokeLinecap="round" />
            {/* Ruler & notebook peeking out */}
            <rect x="104" y="54" width="16" height="34" rx="3" transform="rotate(-12 104 54)" fill="#F59E0B" />
            <rect x="132" y="50" width="38" height="34" rx="4" transform="rotate(6 132 50)" fill="#38BDF8" />
            {/* Front pocket */}
            <rect x="92" y="104" width="96" height="62" rx="18" fill="#6D28D9" />
            <rect x="96" y="108" width="88" height="54" rx="15" fill="#7C3AED" />
            <line x1="108" y1="122" x2="172" y2="122" stroke="#DDD6FE" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="156" y="117" width="10" height="10" rx="2.5" fill="#FDE68A" />
            {/* Reflective front badge */}
            <rect x="124" y="140" width="32" height="8" rx="4" fill="#EDE9FE" />
          </g>
        )}

        {artworkId === 'explorer-pack' && (
          <g>
            <path d="M122 44C122 30 158 30 158 44" stroke="#1E3A8A" strokeWidth="9" strokeLinecap="round" />
            <rect x="76" y="42" width="128" height="138" rx="28" fill="#2563EB" />
            <rect x="84" y="50" width="112" height="122" rx="22" fill="#3B82F6" />
            <path d="M92 92H188" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" />
            <rect x="96" y="104" width="88" height="58" rx="14" fill="#1D4ED8" />
            <rect x="102" y="110" width="76" height="46" rx="10" fill="#60A5FA" fillOpacity="0.35" />
            <line x1="112" y1="122" x2="168" y2="122" stroke="#DBEAFE" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="128" y="64" width="24" height="14" rx="4" fill="#FBBF24" />
          </g>
        )}

        {artworkId === 'ruled-notebooks' && (
          <g>
            {/* Bottom notebook */}
            <rect x="66" y="66" width="116" height="114" rx="10" transform="rotate(-8 66 66)" fill="#F59E0B" />
            <rect x="78" y="66" width="14" height="114" transform="rotate(-8 66 66)" fill="#D97706" />
            {/* Middle notebook */}
            <rect x="86" y="52" width="116" height="118" rx="10" transform="rotate(3 86 52)" fill="#0EA5E9" />
            <rect x="86" y="52" width="16" height="118" rx="4" transform="rotate(3 86 52)" fill="#0284C7" />
            {/* Top hero notebook */}
            <rect x="98" y="42" width="114" height="124" rx="10" fill="#6D3DF5" />
            <rect x="98" y="42" width="16" height="124" rx="4" fill="#4C1D95" />
            {/* Page edges */}
            <rect x="198" y="50" width="10" height="108" rx="2" fill="#FAF8F5" />
            {/* Subject label card */}
            <rect x="128" y="64" width="60" height="34" rx="5" fill="#FFFFFF" />
            <line x1="136" y1="76" x2="180" y2="76" stroke="#181622" strokeWidth="3" strokeLinecap="round" />
            <line x1="136" y1="86" x2="168" y2="86" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {artworkId === 'grid-journal' && (
          <g>
            {/* Back notebook */}
            <rect x="92" y="44" width="112" height="130" rx="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
            {/* Front spiral grid notebook */}
            <rect x="74" y="52" width="116" height="128" rx="10" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
            {/* Grid lines */}
            <path
              d="M96 68V166M116 68V166M136 68V166M156 68V166M86 84H176M86 104H176M86 124H176M86 144H176"
              stroke="#BAE6FD"
              strokeWidth="1.5"
            />
            {/* Spiral binding */}
            {[64, 82, 100, 118, 136, 154, 170].map((cy) => (
              <rect key={cy} x="64" y={cy - 3} width="20" height="6" rx="3" fill="#334155" />
            ))}
            {/* Plotted triangle */}
            <path d="M106 144L136 92L160 144H106Z" stroke="#0EA5E9" strokeWidth="3" fill="#38BDF8" fillOpacity="0.2" />
          </g>
        )}

        {artworkId === 'math-geometry-set' && (
          <g>
            {/* Metal tin case */}
            <rect x="52" y="54" width="176" height="114" rx="14" fill="#CBD5E1" />
            <rect x="58" y="60" width="164" height="102" rx="10" fill="#F8FAFC" />
            {/* Protractor */}
            <path d="M80 144A42 42 0 0 1 164 144H80Z" fill="#FDE68A" stroke="#D97706" strokeWidth="2.5" />
            <path d="M98 144A24 24 0 0 1 146 144" stroke="#D97706" strokeWidth="2" />
            {/* Yellow calibrated ruler */}
            <rect x="66" y="72" width="146" height="22" rx="4" fill="#F59E0B" />
            {[78, 92, 106, 120, 134, 148, 162, 176, 190, 204].map((x) => (
              <line key={x} x1={x} y1="72" x2={x} y2="81" stroke="#78350F" strokeWidth="2" />
            ))}
            {/* Brass compass */}
            <circle cx="188" cy="108" r="7" fill="#475569" />
            <path d="M186 114L172 154M190 114L204 154" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="178" y1="136" x2="198" y2="136" stroke="#94A3B8" strokeWidth="3" />
          </g>
        )}

        {artworkId === 'gel-pencil-kit' && (
          <g>
            {/* Pencil 1 */}
            <g transform="rotate(-14 95 110)">
              <rect x="82" y="48" width="14" height="108" rx="3" fill="#F59E0B" />
              <rect x="82" y="48" width="14" height="14" rx="3" fill="#FB7185" />
              <polygon points="82,156 96,156 89,174" fill="#FDE68A" />
              <polygon points="86,166 92,166 89,174" fill="#1E293B" />
            </g>
            {/* Gel Pen Violet */}
            <g transform="rotate(4 140 110)">
              <rect x="131" y="44" width="16" height="114" rx="6" fill="#6D3DF5" />
              <rect x="131" y="70" width="16" height="36" fill="#A78BFA" />
              <polygon points="134,158 144,158 139,174" fill="#E2E8F0" />
              <rect x="147" y="54" width="4" height="28" rx="2" fill="#4C1D95" />
            </g>
            {/* Gel Pen Teal */}
            <g transform="rotate(18 182 110)">
              <rect x="174" y="48" width="15" height="108" rx="6" fill="#0EA5E9" />
              <polygon points="177,156 186,156 181.5,172" fill="#E2E8F0" />
            </g>
            {/* Eraser block */}
            <rect x="108" y="152" width="54" height="26" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
            <rect x="108" y="152" width="24" height="26" rx="5" fill="#EC4899" />
          </g>
        )}

        {artworkId === 'pleated-uniform' && (
          <g>
            {/* Crisp white polo collar shirt */}
            <path
              d="M96 42L122 34H158L184 42L204 72L182 84L174 70V108H106V70L98 84L76 72L96 42Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />
            {/* Purple collar & sleeve trim */}
            <path d="M122 34L140 54L158 34" fill="#7C3AED" />
            <rect x="106" y="98" width="68" height="8" fill="#8B5CF6" />
            {/* Pleated purple skirt */}
            <path d="M104 106H176L194 172H86L104 106Z" fill="#7C3AED" />
            <path
              d="M116 106L106 172M128 106L124 172M140 106V172M152 106L156 172M164 106L174 172"
              stroke="#5B21B6"
              strokeWidth="2.5"
            />
          </g>
        )}

        {artworkId === 'oxford-uniform' && (
          <g>
            {/* Oxford shirt */}
            <path
              d="M94 40L122 32H158L186 40L202 74L180 84L172 68V108H108V68L100 84L78 74L94 40Z"
              fill="#F8FAFC"
              stroke="#94A3B8"
              strokeWidth="2.5"
            />
            <line x1="140" y1="44" x2="140" y2="108" stroke="#CBD5E1" strokeWidth="2" />
            {/* Chino trousers */}
            <path
              d="M104 108H176L182 178H150L140 132L130 178H98L104 108Z"
              fill="#334155"
            />
            <rect x="104" y="106" width="72" height="9" rx="2" fill="#1E293B" />
          </g>
        )}

        {artworkId === 'school-sneakers' && (
          <g>
            {/* Back shoe */}
            <path
              d="M68 122C74 96 98 86 118 92L152 114C164 118 176 122 176 134V142H64V122Z"
              fill="#E2E8F0"
            />
            {/* Front hero sneaker */}
            <path
              d="M78 134C82 102 108 90 130 98L168 122C186 126 204 130 206 146V156H74V134Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />
            {/* Outsole */}
            <rect x="72" y="152" width="136" height="14" rx="7" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" />
            {/* Purple heel & strap accent */}
            <path d="M80 124C84 108 98 100 112 102L104 134H78L80 124Z" fill="#6D3DF5" />
            <line x1="130" y1="108" x2="152" y2="120" stroke="#6D3DF5" strokeWidth="4" strokeLinecap="round" />
            <line x1="122" y1="116" x2="144" y2="128" stroke="#6D3DF5" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {artworkId === 'cotton-socks' && (
          <g>
            {/* Back sock */}
            <path
              d="M116 46H150V116L178 136C186 142 182 158 168 158H126C116 158 112 148 114 138L116 46Z"
              fill="#E2E8F0"
              stroke="#94A3B8"
              strokeWidth="2"
            />
            {/* Front white ribbed sock */}
            <path
              d="M84 54H122V124L154 146C164 152 158 170 144 170H96C84 170 80 158 82 148L84 54Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="2.5"
            />
            <line x1="86" y1="68" x2="120" y2="68" stroke="#6D3DF5" strokeWidth="5" />
            <line x1="86" y1="78" x2="120" y2="78" stroke="#A78BFA" strokeWidth="4" />
            <path d="M84 148C94 144 100 154 96 168" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />
          </g>
        )}

        {artworkId === 'insulated-bottle' && (
          <g>
            {/* Carry loop */}
            <circle cx="140" cy="40" r="12" stroke="#1E293B" strokeWidth="5" fill="none" />
            {/* Bottle cap */}
            <rect x="116" y="46" width="48" height="22" rx="6" fill="#1E293B" />
            <rect x="122" y="68" width="36" height="8" fill="#94A3B8" />
            {/* Stainless body */}
            <rect x="104" y="76" width="72" height="102" rx="18" fill="#06B6D4" />
            <rect x="112" y="80" width="16" height="94" rx="8" fill="#67E8F9" fillOpacity="0.45" />
            {/* Protective silicone boot */}
            <path d="M104 154H176V166C176 174 168 180 160 180H120C112 180 104 174 104 166V154Z" fill="#0E7490" />
          </g>
        )}

        {artworkId === 'bento-lunchbox' && (
          <g>
            {/* Outer shell */}
            <rect x="58" y="54" width="164" height="118" rx="18" fill="#6D3DF5" />
            <rect x="66" y="62" width="148" height="102" rx="12" fill="#FFFFFF" />
            {/* Bento compartments */}
            <rect x="74" y="70" width="70" height="86" rx="8" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
            <rect x="150" y="70" width="56" height="40" rx="8" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
            <rect x="150" y="116" width="56" height="40" rx="8" fill="#F3E8FF" stroke="#8B5CF6" strokeWidth="2" />
            {/* Cute food silhouettes */}
            <rect x="86" y="84" width="46" height="38" rx="6" fill="#FDE68A" />
            <circle cx="178" cy="90" r="11" fill="#EF4444" />
            <circle cx="178" cy="136" r="10" fill="#10B981" />
            {/* Front latch */}
            <rect x="118" y="168" width="44" height="10" rx="5" fill="#4C1D95" />
          </g>
        )}

        {artworkId === 'desk-atlas-kit' && (
          <g>
            {/* Pocket world atlas */}
            <rect x="64" y="48" width="104" height="122" rx="8" fill="#F97316" />
            <rect x="74" y="58" width="84" height="102" rx="4" fill="#FFF7ED" />
            <circle cx="116" cy="102" r="28" fill="#38BDF8" />
            <path d="M100 94C108 86 122 92 126 102C128 110 116 120 106 114Z" fill="#22C55E" />
            {/* Zippered canvas supply pouch */}
            <rect x="118" y="118" width="102" height="54" rx="14" fill="#6D3DF5" />
            <line x1="126" y1="130" x2="212" y2="130" stroke="#FDE68A" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="204" cy="130" r="5" fill="#F59E0B" />
          </g>
        )}

        {/* Subtle accent dot glint */}
        <circle cx="236" cy="42" r="4" fill={accentHex} fillOpacity="0.25" />
      </svg>
    </div>
  );
};
