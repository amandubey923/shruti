'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Bookmark, Layers } from 'lucide-react';
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
      className={`group relative bg-background-card hover:bg-background-elevated border border-background-border/60 hover:border-background-border rounded-2xl transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        featured ? 'md:col-span-2 md:flex-row' : ''
      }`}
    >
      {/* Artwork container */}
      <div
        className={`relative overflow-hidden bg-background-elevated ${
          featured
            ? 'w-full md:w-5/12 aspect-[4/3] md:aspect-auto min-h-[220px]'
            : 'w-full aspect-[16/10]'
        }`}
      >
        {series.coverImage ? (
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-accent">
            <Layers className="w-10 h-10" />
          </div>
        )}

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background-card via-transparent to-transparent opacity-80" />

        {/* Category tag */}
        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-background/80 backdrop-blur-md rounded-md text-[10px] uppercase font-semibold tracking-wider text-accent border border-background-border/50">
          {series.category}
        </span>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSaveSeries(series.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-md border border-background-border/40 transition-colors ${
            isSaved ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'
          }`}
          aria-label={isSaved ? 'Remove from saved' : 'Save series'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content Meta */}
      <div className={`p-4 sm:p-5 flex flex-col justify-between flex-1`}>
        <div>
          <div className="flex items-center gap-2 text-[11px] text-foreground-subtle mb-1">
            <span className="font-medium text-foreground-muted">{series.artistName}</span>
            <span>•</span>
            <span>{series.totalTracks} Parts</span>
            <span>•</span>
            <span>{formatDurationHuman(series.totalDuration)}</span>
          </div>

          <Link href={`/series/${series.slug || series.id}`} className="group-hover:text-accent transition-colors block">
            <h3 className="font-serif text-base sm:text-lg font-bold text-foreground leading-snug">
              {series.title}
            </h3>
          </Link>

          {series.subtitle && (
            <p className="text-xs text-foreground-muted mt-1 line-clamp-1 italic">
              {series.subtitle}
            </p>
          )}

          <p className="text-xs text-foreground-subtle mt-2 line-clamp-2 leading-relaxed">
            {series.description}
          </p>
        </div>

        {/* Action Link */}
        <div className="mt-4 pt-3 border-t border-background-border/40 flex items-center justify-between">
          <Link
            href={`/series/${series.slug || series.id}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Explore Series</span>
          </Link>

          {series.language && (
            <span className="text-[10px] text-foreground-subtle font-mono uppercase">
              {series.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

