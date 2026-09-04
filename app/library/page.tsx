'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, History, Layers, Bookmark, Sparkles, Compass } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { getAllTracks, getAllSeries, normalizeSeriesId } from '@/lib/firestore';
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
      const sSaved = allS.filter((s) => {
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
      setFavoriteTracks(favs);
      setSavedSeriesList(sSaved);
    }
    loadData();
  }, [favorites, savedSeries]);

  return (
    <div className="space-y-10 sm:space-y-12 animate-fade-in pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase">
          <Layers className="w-3.5 h-3.5" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-foreground">
          My Library &amp; Bookmarks
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted max-w-2xl font-normal">
          Your saved discourses, book collections, and continuous listening history.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          href="/library/favorites"
          className="p-6 rounded-3xl bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <Heart className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform fill-current" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">
              Saved Audio
            </h3>
            <p className="text-xs font-medium text-foreground-subtle mt-1">{favorites.length} Recordings</p>
          </div>
        </Link>

        <Link
          href="/library/series"
          className="p-6 rounded-3xl bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mb-6">
            <Bookmark className="w-6 h-6 text-accent group-hover:scale-110 transition-transform fill-current" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">
              Saved Series
            </h3>
            <p className="text-xs font-medium text-foreground-subtle mt-1">{savedSeries.length} Collections</p>
          </div>
        </Link>

        <Link
          href="/library/history"
          className="p-6 rounded-3xl bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
        >
          <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center mb-6">
            <History className="w-6 h-6 text-accent group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-foreground group-hover:text-accent transition-colors">
              Listening History
            </h3>
            <p className="text-xs font-medium text-foreground-subtle mt-1">{history.length} Listened</p>
          </div>
        </Link>
      </div>

      {savedSeriesList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Saved Series &amp; Discourses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSeriesList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      )}

      {favoriteTracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Saved Favorite Recordings
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {favoriteTracks.map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {savedSeriesList.length === 0 && favoriteTracks.length === 0 && (
        <div className="py-20 text-center space-y-4 bg-background-card/60 rounded-3xl border border-background-border max-w-lg mx-auto p-6">
          <div className="w-14 h-14 rounded-full bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-foreground">Your Library is Calm and Empty</h3>
            <p className="text-xs sm:text-sm text-foreground-muted">
              Start listening to discourses or series and bookmark your favorite tracks to build your personal sanctuary.
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-stone-950 font-bold text-xs sm:text-sm shadow-md"
          >
            <span>Browse Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
}
