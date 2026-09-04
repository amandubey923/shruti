'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Layers, Compass } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { getAllSeries, normalizeSeriesId } from '@/lib/firestore';
import { Series } from '@/types/audio';
import { SeriesCard } from '@/components/audio/SeriesCard';

export default function SavedSeriesPage() {
  const { savedSeries } = useLibrary();
  const [savedSeriesList, setSavedSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedSeries() {
      const all = await getAllSeries();
      const matched = all.filter((s) => {
        const normSId = normalizeSeriesId(s.id);
        const normSlug = s.slug ? normalizeSeriesId(s.slug) : normSId;
        return (
          savedSeries.includes(s.id) ||
          (s.slug && savedSeries.includes(s.slug)) ||
          savedSeries.includes(normSId) ||
          savedSeries.includes(normSlug) ||
          savedSeries.some((savedId) => {
            const normSaved = normalizeSeriesId(savedId);
            return normSaved === normSId || normSaved === normSlug;
          })
        );
      });
      setSavedSeriesList(matched);
      setLoading(false);
    }
    loadSavedSeries();
  }, [savedSeries]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-16">
      {/* Back Navigation */}
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-background-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-accent mb-1">
            <Bookmark className="w-4 h-4 fill-current" />
            <span className="text-xs uppercase tracking-wider font-semibold">Bookmarks</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Saved Series &amp; Collections
          </h1>
          <p className="text-xs text-foreground-subtle mt-1">
            {savedSeriesList.length} archival collections saved to your study library.
          </p>
        </div>

        <Link
          href="/explore?tab=series"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-elevated hover:bg-background-hover border border-background-border text-foreground-muted hover:text-foreground text-xs font-semibold transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-accent" />
          <span>Browse All Series</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-card border border-background-border rounded-3xl p-4 space-y-3"
            >
              <div className="aspect-[16/10] bg-background-elevated rounded-2xl w-full" />
              <div className="h-4 bg-background-elevated rounded-md w-3/4" />
              <div className="h-3 bg-background-elevated rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : savedSeriesList.length === 0 ? (
        <div className="py-20 text-center text-foreground-subtle text-xs bg-background-card rounded-3xl border border-background-border p-8 space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-foreground">No saved series yet</h3>
          <p className="text-xs text-foreground-muted leading-relaxed">
            Explore our spiritual audio archive and tap the bookmark icon on any series to save it for continuous contemplation.
          </p>
          <div className="pt-2">
            <Link
              href="/explore?tab=series"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs rounded-full shadow-md transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Series Catalog</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {savedSeriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      )}
    </div>
  );
}
