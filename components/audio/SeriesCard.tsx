'use client';

import React from 'react';
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

export function SeriesCard({ series, featured = false }: SeriesCardProps) {
  const { isSeriesSaved, toggleSaveSeries } = useLibrary();
  const isSaved = isSeriesSaved(series.id);

  return (
    <div
      className={`group relative bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 rounded-3xl transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
        featured ? 'md:col-span-2 lg:col-span-3 md:flex-row' : ''
      }`}
    >
      {/* Cover Artwork Container */}
      <div
        className={`relative overflow-hidden bg-background-elevated flex-shrink-0 ${
          featured
            ? 'w-full md:w-5/12 aspect-[4/3] md:aspect-auto min-h-[260px]'
            : 'w-full aspect-[16/10]'
        }`}
      >
        {series.coverImage ? (
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-accent">
            <Layers className="w-12 h-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background-card/90 via-transparent to-black/20" />

        {/* Category Badge */}
        <span className="absolute top-3.5 left-3.5 px-3 py-1 bg-background/90 backdrop-blur-md rounded-full text-[10px] uppercase font-bold tracking-wider text-accent border border-background-border/80 shadow-xs">
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
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-background/90 backdrop-blur-md border border-background-border/80 transition-all flex items-center justify-center active:scale-90 ${
            isSaved ? 'text-accent border-accent/40' : 'text-foreground-subtle hover:text-foreground'
          }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save series'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Series Details & Primary CTA */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground-subtle">
            <span className="text-foreground font-semibold">{series.artistName}</span>
            <span>•</span>
            <span className="text-foreground-muted">{series.totalTracks} Parts</span>
            <span>•</span>
            <div className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-accent" />
              <span>{formatDurationHuman(series.totalDuration)}</span>
            </div>
          </div>

          <Link href={`/series/${series.slug || series.id}`} className="group-hover:text-accent transition-colors block">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-snug">
              {series.title}
            </h3>
          </Link>

          {series.subtitle && (
            <p className="text-xs text-foreground-muted italic font-serif">
              {series.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-foreground-muted line-clamp-2 sm:line-clamp-3 leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Action Row with prominent primary button */}
        <div className="pt-4 border-t border-background-border/60 flex items-center justify-between gap-3">
          <Link
            href={`/series/${series.slug || series.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/15 hover:bg-accent hover:text-stone-950 text-accent font-bold text-xs sm:text-sm border border-accent/30 hover:border-transparent transition-all shadow-xs active:scale-95 group/btn"
          >
            <Play className="w-3.5 h-3.5 fill-current transition-transform group-hover/btn:scale-110" />
            <span>Explore Series</span>
          </Link>

          {series.language && (
            <span className="text-[10px] font-mono uppercase font-semibold text-foreground-subtle px-2 py-0.5 rounded bg-background-elevated border border-background-border">
              {series.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
