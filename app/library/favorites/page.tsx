'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ArrowLeft, Play } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { getAllTracks } from '@/lib/firestore';
import { AudioTrack } from '@/types/audio';
import { TrackRow } from '@/components/audio/TrackRow';
import { usePlayback } from '@/context/PlaybackContext';

export default function FavoritesPage() {
  const { favorites } = useLibrary();
  const [favoriteTracks, setFavoriteTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const { playSeriesAll } = usePlayback();

  useEffect(() => {
    async function loadFavs() {
      const all = await getAllTracks();
      const favList = all.filter((t) => favorites.includes(t.id));
      setFavoriteTracks(favList);
      setLoading(false);
    }
    loadFavs();
  }, [favorites]);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-background-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs uppercase tracking-wider font-semibold">Favorites</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Saved Recordings
          </h1>
          <p className="text-xs text-foreground-subtle mt-1">
            {favoriteTracks.length} recordings in your favorite list.
          </p>
        </div>

        {favoriteTracks.length > 0 && (
          <button
            onClick={() => playSeriesAll(favoriteTracks, 0)}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs shadow-md shadow-accent/20 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play All</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-foreground-subtle text-xs">
          Loading favorites...
        </div>
      ) : favoriteTracks.length === 0 ? (
        <div className="py-16 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border space-y-2">
          <p className="text-sm text-foreground">No favorite recordings yet</p>
          <p className="text-xs text-foreground-subtle">
            Explore the catalog and tap the heart icon on any discourse or raga.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-2 px-4 py-1.5 bg-background-elevated hover:bg-background-hover text-accent rounded-full border border-background-border text-xs"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/30">
          {favoriteTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              index={idx}
              onPlay={() => playSeriesAll(favoriteTracks, idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
