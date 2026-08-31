'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type CoverTheme =
  | 'royal-violet'
  | 'midnight-indigo'
  | 'burnt-saffron'
  | 'velvet-plum'
  | 'forest-emerald'
  | 'ocean-teal'
  | 'crimson-ruby'
  | 'charcoal-slate'
  | 'desert-amber'
  | 'cosmic-cobalt'
  | 'sage-olive'
  | 'bordeaux-wine';

export type TexturePattern =
  | 'concentric-rings'
  | 'sacred-lattice'
  | 'sound-waves'
  | 'celestial-dots'
  | 'archival-grid'
  | 'none';

export type GlyphSymbol =
  | 'concentric-yantra'
  | 'sacred-lotus'
  | 'sound-spiral'
  | 'dawn-sun'
  | 'eternal-knot'
  | 'flame-witness'
  | 'temple-bell'
  | 'harmonic-wave';

export type FrameStyle =
  | 'classic-inset'
  | 'double-hairline'
  | 'notched-corners'
  | 'temple-arch'
  | 'dashed-accent';

export interface ShrutiCoverProps {
  title: string;
  hindiTitle?: string;
  subtitle?: string;
  speaker?: string;
  category?: string;
  seriesId?: string; // Used to deterministically generate a unique identity if theme/pattern not explicitly passed
  theme?: CoverTheme;
  texture?: TexturePattern;
  glyph?: GlyphSymbol;
  frame?: FrameStyle;
  className?: string;
  aspectRatio?: 'square' | 'portrait';
}

interface ThemeConfig {
  bgGradient: string;
  outerBorder: string;
  innerFrame: string;
  titleColor: string;
  accentColor: string;
  mutedColor: string;
  subtleColor: string;
  badgeBg: string;
  badgeBorder: string;
  textureColor: string;
}

const THEMES: Record<CoverTheme, ThemeConfig> = {
  'royal-violet': {
    bgGradient: 'from-[#1E0B36] via-[#140626] to-[#0D031A]',
    outerBorder: 'border-[#5B21B6]/50',
    innerFrame: 'border-[#8B5CF6]/35',
    titleColor: 'text-[#F5F3FF]',
    accentColor: 'text-[#C4B5FD]',
    mutedColor: 'text-[#DDD6FE]/75',
    subtleColor: 'text-[#A78BFA]/50',
    badgeBg: 'bg-[#5B21B6]/30',
    badgeBorder: 'border-[#8B5CF6]/40',
    textureColor: '#8B5CF6',
  },
  'midnight-indigo': {
    bgGradient: 'from-[#0B1528] via-[#070F1E] to-[#030712]',
    outerBorder: 'border-[#1E3A8A]/50',
    innerFrame: 'border-[#38BDF8]/35',
    titleColor: 'text-[#F0F9FF]',
    accentColor: 'text-[#38BDF8]',
    mutedColor: 'text-[#BAE6FD]/75',
    subtleColor: 'text-[#7DD3FC]/50',
    badgeBg: 'bg-[#0369A1]/25',
    badgeBorder: 'border-[#38BDF8]/40',
    textureColor: '#38BDF8',
  },
  'burnt-saffron': {
    bgGradient: 'from-[#2D1204] via-[#1F0C02] to-[#120601]',
    outerBorder: 'border-[#9A3412]/50',
    innerFrame: 'border-[#EA580C]/35',
    titleColor: 'text-[#FFF7ED]',
    accentColor: 'text-[#FB923C]',
    mutedColor: 'text-[#FED7AA]/75',
    subtleColor: 'text-[#FDBA74]/50',
    badgeBg: 'bg-[#9A3412]/30',
    badgeBorder: 'border-[#EA580C]/40',
    textureColor: '#FB923C',
  },
  'velvet-plum': {
    bgGradient: 'from-[#2A0826] via-[#1C0519] to-[#0F020E]',
    outerBorder: 'border-[#86198F]/50',
    innerFrame: 'border-[#D946EF]/35',
    titleColor: 'text-[#FDF4FF]',
    accentColor: 'text-[#E879F9]',
    mutedColor: 'text-[#F5D0FE]/75',
    subtleColor: 'text-[#E879F9]/50',
    badgeBg: 'bg-[#86198F]/25',
    badgeBorder: 'border-[#D946EF]/40',
    textureColor: '#D946EF',
  },
  'forest-emerald': {
    bgGradient: 'from-[#032619] via-[#021B12] to-[#010F09]',
    outerBorder: 'border-[#065F46]/50',
    innerFrame: 'border-[#10B981]/35',
    titleColor: 'text-[#ECFDF5]',
    accentColor: 'text-[#34D399]',
    mutedColor: 'text-[#A7F3D0]/75',
    subtleColor: 'text-[#6EE7B7]/50',
    badgeBg: 'bg-[#065F46]/30',
    badgeBorder: 'border-[#10B981]/40',
    textureColor: '#10B981',
  },
  'ocean-teal': {
    bgGradient: 'from-[#042426] via-[#021719] to-[#010C0D]',
    outerBorder: 'border-[#115E59]/50',
    innerFrame: 'border-[#14B8A6]/35',
    titleColor: 'text-[#F0FDFA]',
    accentColor: 'text-[#2DD4BF]',
    mutedColor: 'text-[#99F6E4]/75',
    subtleColor: 'text-[#5EEAD4]/50',
    badgeBg: 'bg-[#115E59]/25',
    badgeBorder: 'border-[#14B8A6]/40',
    textureColor: '#14B8A6',
  },
  'crimson-ruby': {
    bgGradient: 'from-[#2C070D] via-[#1E0408] to-[#100204]',
    outerBorder: 'border-[#9F1239]/50',
    innerFrame: 'border-[#F43F5E]/35',
    titleColor: 'text-[#FFF1F2]',
    accentColor: 'text-[#FB7185]',
    mutedColor: 'text-[#FECDD3]/75',
    subtleColor: 'text-[#FDA4AF]/50',
    badgeBg: 'bg-[#9F1239]/30',
    badgeBorder: 'border-[#F43F5E]/40',
    textureColor: '#F43F5E',
  },
  'charcoal-slate': {
    bgGradient: 'from-[#18181B] via-[#111113] to-[#09090B]',
    outerBorder: 'border-[#3F3F46]/60',
    innerFrame: 'border-[#A1A1AA]/35',
    titleColor: 'text-[#FAFAFA]',
    accentColor: 'text-[#E4E4E7]',
    mutedColor: 'text-[#D4D4D8]/75',
    subtleColor: 'text-[#A1A1AA]/50',
    badgeBg: 'bg-[#27272A]/40',
    badgeBorder: 'border-[#71717A]/40',
    textureColor: '#A1A1AA',
  },
  'desert-amber': {
    bgGradient: 'from-[#2A1A05] via-[#1C1103] to-[#0F0901]',
    outerBorder: 'border-[#854D0E]/50',
    innerFrame: 'border-[#EAB308]/35',
    titleColor: 'text-[#FEFCE8]',
    accentColor: 'text-[#FACC15]',
    mutedColor: 'text-[#FEF08A]/75',
    subtleColor: 'text-[#FDE047]/50',
    badgeBg: 'bg-[#854D0E]/30',
    badgeBorder: 'border-[#EAB308]/40',
    textureColor: '#EAB308',
  },
  'cosmic-cobalt': {
    bgGradient: 'from-[#0C1236] via-[#070B24] to-[#030514]',
    outerBorder: 'border-[#312E81]/50',
    innerFrame: 'border-[#6366F1]/35',
    titleColor: 'text-[#EEF2FF]',
    accentColor: 'text-[#818CF8]',
    mutedColor: 'text-[#C7D2FE]/75',
    subtleColor: 'text-[#A5B4FC]/50',
    badgeBg: 'bg-[#3730A3]/25',
    badgeBorder: 'border-[#6366F1]/40',
    textureColor: '#6366F1',
  },
  'sage-olive': {
    bgGradient: 'from-[#192209] via-[#101705] to-[#080C02]',
    outerBorder: 'border-[#3F6212]/50',
    innerFrame: 'border-[#84CC16]/35',
    titleColor: 'text-[#F7FEE7]',
    accentColor: 'text-[#A3E635]',
    mutedColor: 'text-[#D9F99D]/75',
    subtleColor: 'text-[#BEF264]/50',
    badgeBg: 'bg-[#3F6212]/30',
    badgeBorder: 'border-[#84CC16]/40',
    textureColor: '#84CC16',
  },
  'bordeaux-wine': {
    bgGradient: 'from-[#240A14] via-[#18060D] to-[#0C0206]',
    outerBorder: 'border-[#881337]/50',
    innerFrame: 'border-[#E11D48]/35',
    titleColor: 'text-[#FFF1F2]',
    accentColor: 'text-[#FB7185]',
    mutedColor: 'text-[#FDA4AF]/75',
    subtleColor: 'text-[#F43F5E]/50',
    badgeBg: 'bg-[#881337]/30',
    badgeBorder: 'border-[#E11D48]/40',
    textureColor: '#E11D48',
  },
};

const THEME_KEYS = Object.keys(THEMES) as CoverTheme[];
const TEXTURE_KEYS: TexturePattern[] = [
  'concentric-rings',
  'sacred-lattice',
  'sound-waves',
  'celestial-dots',
  'archival-grid',
];
const GLYPH_KEYS: GlyphSymbol[] = [
  'concentric-yantra',
  'sacred-lotus',
  'sound-spiral',
  'dawn-sun',
  'eternal-knot',
  'flame-witness',
  'temple-bell',
  'harmonic-wave',
];
const FRAME_KEYS: FrameStyle[] = [
  'classic-inset',
  'double-hairline',
  'notched-corners',
  'temple-arch',
  'dashed-accent',
];

/**
 * Deterministic hash function so any given series/folder name maps to
 * a completely stable, unique visual identity.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function resolveSeriesIdentity(seriesKey: string) {
  const h = hashString(seriesKey.toLowerCase().trim());
  const theme = THEME_KEYS[h % THEME_KEYS.length];
  const texture = TEXTURE_KEYS[(h >> 2) % TEXTURE_KEYS.length];
  const glyph = GLYPH_KEYS[(h >> 4) % GLYPH_KEYS.length];
  const frame = FRAME_KEYS[(h >> 6) % FRAME_KEYS.length];
  return { theme, texture, glyph, frame };
}

/* =========================================================================
   GLYPH COMPONENTS (Unique subtle symbolic elements)
   ========================================================================= */

function GlyphIcon({ glyph, className }: { glyph: GlyphSymbol; className?: string }) {
  const common = 'w-9 h-9 fill-none stroke-current opacity-85';

  switch (glyph) {
    case 'concentric-yantra':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <circle cx="24" cy="24" r="18" strokeDasharray="3 2" />
          <circle cx="24" cy="24" r="12" />
          <circle cx="24" cy="24" r="5" />
          <circle cx="24" cy="24" r="1.5" className="fill-current" />
          <path d="M24 2v4M24 42v4M2 24h4M42 24h4" strokeLinecap="round" />
        </svg>
      );

    case 'sacred-lotus':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <path d="M24 38c0-8 8-14 8-20 0-4-3.5-7-8-7s-8 3-8 7c0 6 8 12 8 20z" />
          <path d="M24 38c-5-6-13-10-15-16-2-4 0-8 4-8 4 0 8 4 11 10" />
          <path d="M24 38c5-6 13-10 15-16 2-4 0-8-4-8-4 0-8 4-11 10" />
          <circle cx="24" cy="18" r="1.5" className="fill-current" />
        </svg>
      );

    case 'sound-spiral':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <path d="M24 24a3 3 0 00-3-3 6 6 0 00-6 6 9 9 0 009 9 12 12 0 0012-12 15 15 0 00-15-15 18 18 0 00-18 18" strokeLinecap="round" />
          <circle cx="24" cy="24" r="1.5" className="fill-current" />
        </svg>
      );

    case 'dawn-sun':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <circle cx="24" cy="24" r="9" />
          <circle cx="24" cy="24" r="2" className="fill-current" />
          <path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" strokeLinecap="round" />
        </svg>
      );

    case 'eternal-knot':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <rect x="14" y="14" width="20" height="20" rx="3" transform="rotate(45 24 24)" />
          <circle cx="24" cy="24" r="6" />
          <circle cx="24" cy="24" r="1.5" className="fill-current" />
        </svg>
      );

    case 'flame-witness':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <path d="M24 8c-4 7-8 12-8 18a8 8 0 0016 0c0-6-4-11-8-18z" />
          <path d="M24 26a3 3 0 00-3 3 3 3 0 006 0c0-2-1.5-3-3-3z" className="fill-current opacity-60" />
        </svg>
      );

    case 'temple-bell':
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <path d="M24 8a4 4 0 00-4 4v2c-5 3-8 8-8 15h24c0-7-3-12-8-15v-2a4 4 0 00-4-4z" />
          <circle cx="24" cy="33" r="2" className="fill-current" />
          <path d="M20 33a4 4 0 008 0" />
        </svg>
      );

    case 'harmonic-wave':
    default:
      return (
        <svg viewBox="0 0 48 48" className={cn(common, className)} strokeWidth="1.2">
          <path d="M8 24c4-8 8-8 12 0s8 8 12 0 8-8 12 0" strokeLinecap="round" />
          <path d="M8 20c4-4 8-4 12 0s8 4 12 0 8-4 12 0" strokeLinecap="round" opacity="0.5" />
          <circle cx="24" cy="24" r="2" className="fill-current" />
        </svg>
      );
  }
}

/* =========================================================================
   TEXTURE WATERMARKS (Subtle background textures)
   ========================================================================= */

function TextureBackground({ texture, color }: { texture: TexturePattern; color: string }) {
  if (texture === 'none') return null;

  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.07] overflow-hidden">
      {texture === 'concentric-rings' && (
        <svg className="w-full h-full" viewBox="0 0 200 200">
          {[20, 40, 60, 80, 100, 120, 140, 160].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4 4" />
          ))}
        </svg>
      )}

      {texture === 'sacred-lattice' && (
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="lattice" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10h20M10 0v20" stroke={color} strokeWidth="0.8" />
            <circle cx="10" cy="10" r="1.5" fill={color} />
          </pattern>
          <rect width="100%" height="100%" fill="url(#lattice)" />
        </svg>
      )}

      {texture === 'sound-waves' && (
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {[15, 30, 45, 60, 75, 90].map((y) => (
            <path key={y} d={`M0 ${y} Q 25 ${y - 8}, 50 ${y} T 100 ${y}`} fill="none" stroke={color} strokeWidth="0.8" />
          ))}
        </svg>
      )}

      {texture === 'celestial-dots' && (
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="8" cy="8" r="0.8" fill={color} />
          </pattern>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      )}

      {texture === 'archival-grid' && (
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M12 0H0v12" fill="none" stroke={color} strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}
    </div>
  );
}

/* =========================================================================
   FRAME BORDERS (Distinct decorative framing variants)
   ========================================================================= */

function FrameBorder({ frame, innerFrameClass, accentColorClass }: { frame: FrameStyle; innerFrameClass: string; accentColorClass: string }) {
  switch (frame) {
    case 'double-hairline':
      return (
        <>
          <div className={cn('absolute inset-2.5 sm:inset-3 rounded-xl border pointer-events-none', innerFrameClass)} />
          <div className={cn('absolute inset-3.5 sm:inset-4 rounded-lg border pointer-events-none opacity-50', innerFrameClass)} />
        </>
      );

    case 'notched-corners':
      return (
        <>
          <div className={cn('absolute inset-2.5 sm:inset-3 rounded-md border pointer-events-none', innerFrameClass)} />
          <div className={cn('absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 pointer-events-none', accentColorClass)} />
          <div className={cn('absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 pointer-events-none', accentColorClass)} />
          <div className={cn('absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 pointer-events-none', accentColorClass)} />
          <div className={cn('absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 pointer-events-none', accentColorClass)} />
        </>
      );

    case 'temple-arch':
      return (
        <div className={cn('absolute inset-2.5 sm:inset-3 rounded-t-full rounded-b-xl border pointer-events-none', innerFrameClass)} />
      );

    case 'dashed-accent':
      return (
        <div className={cn('absolute inset-2.5 sm:inset-3 rounded-xl border border-dashed pointer-events-none', innerFrameClass)} />
      );

    case 'classic-inset':
    default:
      return (
        <>
          <div className={cn('absolute inset-2.5 sm:inset-3 rounded-xl border pointer-events-none', innerFrameClass)} />
          <div className={cn('absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full opacity-40 bg-current', accentColorClass)} />
          <div className={cn('absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full opacity-40 bg-current', accentColorClass)} />
          <div className={cn('absolute bottom-3.5 left-3.5 w-1.5 h-1.5 rounded-full opacity-40 bg-current', accentColorClass)} />
          <div className={cn('absolute bottom-3.5 right-3.5 w-1.5 h-1.5 rounded-full opacity-40 bg-current', accentColorClass)} />
        </>
      );
  }
}

/* =========================================================================
   MAIN SHRUTI COVER COMPONENT
   ========================================================================= */

export function ShrutiCover({
  title,
  hindiTitle,
  subtitle,
  speaker = 'SHRUTI MASTER',
  category = 'DISCOURSES',
  seriesId,
  theme: explicitTheme,
  texture: explicitTexture,
  glyph: explicitGlyph,
  frame: explicitFrame,
  className = '',
  aspectRatio = 'portrait',
}: ShrutiCoverProps) {
  // If seriesId is provided and explicit properties are omitted,
  // deterministically resolve a distinct visual identity for this folder/series.
  const resolved = seriesId
    ? resolveSeriesIdentity(seriesId)
    : {
        theme: explicitTheme || 'royal-violet',
        texture: explicitTexture || 'concentric-rings',
        glyph: explicitGlyph || 'concentric-yantra',
        frame: explicitFrame || 'classic-inset',
      };

  const finalThemeKey = explicitTheme || resolved.theme;
  const finalTexture = explicitTexture || resolved.texture;
  const finalGlyph = explicitGlyph || resolved.glyph;
  const finalFrame = explicitFrame || resolved.frame;

  const t = THEMES[finalThemeKey] || THEMES['royal-violet'];

  return (
    <div
      className={cn(
        'relative overflow-hidden select-none flex flex-col justify-between p-4 sm:p-5 rounded-2xl border shadow-2xl transition-transform bg-gradient-to-b',
        t.bgGradient,
        t.outerBorder,
        aspectRatio === 'portrait' ? 'aspect-[3/4]' : 'aspect-square',
        className
      )}
    >
      {/* Background Texture Pattern */}
      <TextureBackground texture={finalTexture} color={t.textureColor} />

      {/* Frame Border Treatment */}
      <FrameBorder
        frame={finalFrame}
        innerFrameClass={t.innerFrame}
        accentColorClass={t.accentColor}
      />

      {/* TOP: Brand Label Badge */}
      <div className="relative z-10 flex flex-col items-center pt-1">
        <div
          className={cn(
            'px-3 py-0.5 rounded-full border text-[8px] sm:text-[9px] uppercase tracking-[0.25em] font-medium transition-all shadow-sm',
            t.badgeBg,
            t.badgeBorder,
            t.mutedColor
          )}
        >
          SHRUTI • ARCHIVE
        </div>
      </div>

      {/* CENTER: Symbolic Glyph & Large Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto px-2 space-y-2.5">
        {/* Subtle Central Archival Glyph */}
        <div className={cn('transition-colors', t.accentColor)}>
          <GlyphIcon glyph={finalGlyph} />
        </div>

        {/* Primary Titles */}
        <div className="space-y-1 max-w-full">
          {hindiTitle && (
            <h3
              className={cn(
                'font-serif font-bold text-base sm:text-lg lg:text-xl tracking-wide leading-tight drop-shadow-sm line-clamp-2',
                t.titleColor
              )}
            >
              {hindiTitle}
            </h3>
          )}

          <h2
            className={cn(
              'font-serif font-bold tracking-wide leading-tight drop-shadow-sm',
              hindiTitle ? 'text-xs sm:text-sm font-semibold opacity-90' : 'text-base sm:text-lg lg:text-xl',
              t.titleColor
            )}
          >
            {title}
          </h2>
        </div>

        {/* Delicate Midpoint Separator Line */}
        <div className="w-16 flex items-center justify-center gap-1.5 opacity-60">
          <div className={cn('flex-1 h-[1px] bg-current', t.accentColor)} />
          <div className={cn('w-1 h-1 rounded-full bg-current', t.accentColor)} />
          <div className={cn('flex-1 h-[1px] bg-current', t.accentColor)} />
        </div>

        {/* Subtitle / Description reflection */}
        {subtitle && (
          <p className={cn('text-[9px] sm:text-[10px] italic font-serif leading-snug line-clamp-2 max-w-[85%]', t.mutedColor)}>
            {subtitle}
          </p>
        )}
      </div>

      {/* BOTTOM: Speaker / Artist Information */}
      <div className="relative z-10 flex flex-col items-center text-center pb-1 space-y-0.5">
        <span className={cn('text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.2em] font-sans font-semibold opacity-70', t.subtleColor)}>
          {category.toUpperCase()} BY
        </span>
        <span className={cn('font-serif text-xs sm:text-sm font-bold tracking-wider uppercase', t.titleColor)}>
          {speaker}
        </span>
        <span className={cn('text-[7px] sm:text-[8px] uppercase tracking-[0.25em] opacity-40 font-mono', t.subtleColor)}>
          COLLECTION
        </span>
      </div>
    </div>
  );
}
