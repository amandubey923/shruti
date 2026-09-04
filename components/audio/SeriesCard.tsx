'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Bookmark, Layers, Clock } from 'lucide-react';
import { Series } from '@/types/audio';
import { useLibrary } from '@/context/LibraryContext';
import { formatDurationHuman } from '@/lib/utils';

interface SeriesCardProps {
  series: Series;
  featured?: boolean;
}

export const SeriesCard = memo(function SeriesCard({ series, featured = false }: SeriesCardProps) {
  const { isSeriesSaved, toggleSaveSeries } = useLibrary();
  const isSaved = isSeriesSaved(series.id);

  return (
    <div
      className="group relative bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 rounded-2xl sm:rounded-3xl transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md h-full"
    >
      {/* Cover Artwork Container */}
      <div
        className="relative overflow-hidden bg-background-elevated flex-shrink-0 w-full aspect-[4/3] sm:aspect-[16/10]"
      >
        {series.coverImage ? (
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-accent">
            <Layers className="w-8 h-8 sm:w-12 sm:h-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background-card/90 via-transparent to-black/20" />

        {/* Category Badge */}
        <span className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 px-2 py-0.5 sm:px-3 sm:py-1 bg-background/90 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-accent border border-background-border/80 shadow-xs">
          {series.category}
        </span>

        {/* Bookmark Action */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveSeries(series.id);
          }}
          className={`absolute top-2 right-2 sm:top-3.5 sm:right-3.5 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-background/90 backdrop-blur-md border border-background-border/80 transition-all flex items-center justify-center active:scale-90 ${
            isSaved ? 'text-accent border-accent/40' : 'text-foreground-subtle hover:text-foreground'
          }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save series'}
        >
          <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Series Details & Primary CTA */}
      <div className="p-3 sm:p-5 lg:p-6 flex flex-col justify-between flex-1 gap-2.5 sm:gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-medium text-foreground-subtle">
            <span className="text-foreground font-semibold truncate max-w-[90px] sm:max-w-none">{series.artistName}</span>
            <span>•</span>
            <span className="text-foreground-muted">{series.totalTracks} Parts</span>
            {series.totalDuration > 0 && (
              <>
                <span className="hidden xs:inline">•</span>
                <div className="hidden xs:inline-flex items-center gap-0.5 sm:gap-1">
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-accent" />
                  <span>{formatDurationHuman(series.totalDuration)}</span>
                </div>
              </>
            )}
          </div>

          <Link href={`/series/${series.slug || series.id}`} className="group-hover:text-accent transition-colors block">
            <h3 className="font-serif text-xs sm:text-lg lg:text-xl font-bold text-foreground leading-tight sm:leading-snug line-clamp-2 min-h-[2.4em] sm:min-h-[2.6em]">
              {series.title}
            </h3>
          </Link>

          {series.subtitle && (
            <p className="hidden sm:block text-xs text-foreground-muted italic font-serif truncate">
              {series.subtitle}
            </p>
          )}

          <p className="hidden sm:block text-xs sm:text-sm text-foreground-muted line-clamp-2 leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Action Row with prominent primary button */}
        <div className="pt-2 sm:pt-4 border-t border-background-border/60 flex items-center justify-between gap-2">
          <Link
            href={`/series/${series.slug || series.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-accent/15 hover:bg-accent hover:text-stone-950 text-accent font-bold text-[11px] sm:text-xs lg:text-sm border border-accent/30 hover:border-transparent transition-all shadow-xs active:scale-95 group/btn"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current transition-transform group-hover/btn:scale-110" />
            <span>Explore</span>
          </Link>

          {series.language && (
            <span className="text-[9px] sm:text-[10px] font-mono uppercase font-semibold text-foreground-subtle px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-background-elevated border border-background-border">
              {series.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
