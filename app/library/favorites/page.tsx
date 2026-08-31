'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Play, Shuffle, ArrowLeft } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { getAllTracks } from '@/lib/firestore';
import { AudioTrack } from '@/types/audio';
import { TrackRow } from '@/components/audio/TrackRow';

export default function FavoritesPage() {
  const { favorites } = useLibrary();
  const { playSeriesAll } = usePlayback();
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracks() {
      const t = await getAllTracks();
      setAllTracks(t);
      setLoading(false);
    }
    loadTracks();
  }, []);

  const favoriteTracks = allTracks.filter((t) => favorites.includes(t.id));

  const handlePlayAll = () => {
    if (favoriteTracks.length > 0) {
      playSeriesAll(favoriteTracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (favoriteTracks.length > 0) {
      const shuffled = [...favoriteTracks].sort(() => Math.random() - 0.5);
      playSeriesAll(shuffled, 0);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold tracking-wider uppercase mb-2">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Saved Favorites</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Favorite Tracks & Talks
          </h1>
          <p className="text-xs sm:text-sm text-foreground-muted mt-1">
            {favoriteTracks.length} recordings saved in your collection.
          </p>
        </div>

        {favoriteTracks.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-background font-semibold text-xs rounded-full shadow transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>
            <button
              onClick={handleShuffleAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-background-elevated hover:bg-background-hover text-foreground font-medium text-xs rounded-full border border-background-border transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
          </div>
        )}
      </div>

      {favoriteTracks.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-background-card rounded-2xl border border-background-border">
          <Heart className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-serif text-lg font-medium text-foreground">No Favorites Yet</h3>
          <p className="text-xs text-foreground-subtle max-w-sm mx-auto">
            Click the heart icon on any discourse or music track to keep it in your personal collection.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold rounded-full text-xs mt-2"
          >
            <span>Explore Audio</span>
          </Link>
        </div>
      ) : (
        <div className="bg-background-card border border-background-border rounded-2xl p-3 divide-y divide-background-border/30">
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

