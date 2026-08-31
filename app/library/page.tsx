'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, History, Layers, Bookmark } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { getAllTracks, getAllSeries } from '@/lib/firestore';
import { AudioTrack, Series } from '@/types/audio';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';

export default function LibraryOverviewPage() {
  const { favorites, savedSeries, history } = useLibrary();
  const [favoriteTracks, setFavoriteTracks] = useState<AudioTrack[]>([]);
  const [savedSeriesList, setSavedSeriesList] = useState<Series[]>([]);

  useEffect(() => {
    async function loadData() {
      const [allT, allS] = await Promise.all([getAllTracks(), getAllSeries()]);
      const favs = allT.filter((t) => favorites.includes(t.id));
      const sSaved = allS.filter((s) => savedSeries.includes(s.id));
      setFavoriteTracks(favs);
      setSavedSeriesList(sSaved);
    }
    loadData();
  }, [favorites, savedSeries]);

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          My Library
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          Your saved discourses, book collections, and listening history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/library/favorites"
          className="p-5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group shadow-sm"
        >
          <Heart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform mb-4" />
          <div>
            <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent">
              Saved Audio
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{favorites.length} Recordings</p>
          </div>
        </Link>

        <Link
          href="/explore?tab=series"
          className="p-5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group shadow-sm"
        >
          <Bookmark className="w-6 h-6 text-accent group-hover:scale-110 transition-transform mb-4" />
          <div>
            <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent">
              Saved Series
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{savedSeries.length} Collections</p>
          </div>
        </Link>

        <Link
          href="/library/history"
          className="p-5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group shadow-sm"
        >
          <History className="w-6 h-6 text-accent group-hover:scale-110 transition-transform mb-4" />
          <div>
            <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent">
              Listening History
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{history.length} Listened</p>
          </div>
        </Link>
      </div>

      {savedSeriesList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Saved Series &amp; Discourses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedSeriesList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      )}

      {favoriteTracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Saved Favorite Recordings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteTracks.map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {savedSeriesList.length === 0 && favoriteTracks.length === 0 && (
        <div className="py-16 text-center text-foreground-subtle bg-background-card rounded-2xl border border-background-border p-8 space-y-3">
          <p className="text-sm font-serif text-foreground font-semibold">Your sanctuary library is currently quiet.</p>
          <p className="text-xs max-w-sm mx-auto">
            Bookmark series or favorite individual discourse parts while listening to quickly return to them here.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-background font-semibold text-xs shadow hover:bg-accent-hover transition-colors"
          >
            <span>Explore Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
}
