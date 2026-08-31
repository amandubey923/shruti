'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, History, ListMusic, Layers, ArrowRight, Bookmark } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { getAllTracks, getAllSeries } from '@/lib/firestore';
import { AudioTrack, Series } from '@/types/audio';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';

export default function LibraryOverviewPage() {
  const { favorites, savedSeries, history, playlists } = useLibrary();
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
          Your saved discourses, listening history, bookmarks, and custom playlists.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          href="/library/favorites"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform mb-3" />
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground group-hover:text-accent">
              Favorites
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{favorites.length} Tracks</p>
          </div>
        </Link>

        <Link
          href="/playlists"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <ListMusic className="w-5 h-5 text-accent group-hover:scale-110 transition-transform mb-3" />
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground group-hover:text-accent">
              Playlists
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{playlists.length} Lists</p>
          </div>
        </Link>

        <Link
          href="/library/history"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <History className="w-5 h-5 text-accent group-hover:scale-110 transition-transform mb-3" />
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground group-hover:text-accent">
              History
            </h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{history.length} Listened</p>
          </div>
        </Link>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border flex flex-col justify-between">
          <Bookmark className="w-5 h-5 text-accent mb-3" />
          <div>
            <h3 className="font-serif text-sm font-bold text-foreground">Saved Series</h3>
            <p className="text-xs text-foreground-subtle mt-0.5">{savedSeries.length} Series</p>
          </div>
        </div>
      </div>

      {savedSeriesList.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Saved Series & Discourses
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedSeriesList.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t border-background-border/60">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-foreground">
            Favorite Recordings
          </h2>
          <Link
            href="/library/favorites"
            className="text-xs text-accent hover:text-accent-hover inline-flex items-center gap-1 font-medium"
          >
            <span>View All ({favorites.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {favoriteTracks.length === 0 ? (
          <div className="py-12 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border">
            You have not favorited any recordings yet. Tap the heart icon on any audio.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteTracks.slice(0, 4).map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
