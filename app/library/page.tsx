'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Heart, History, ListMusic, Bookmark, ArrowRight, Play } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';
import { getAllTracks, getAllSeries } from '@/lib/firestore';
import { AudioTrack, Series } from '@/types/audio';
import { TrackRow } from '@/components/audio/TrackRow';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { formatDuration } from '@/lib/utils';
import { usePlayback } from '@/context/PlaybackContext';

export default function LibraryPage() {
  const { user } = useAuth();
  const { favorites, savedSeries, history, playlists } = useLibrary();
  const { playTrack } = usePlayback();

  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [t, s] = await Promise.all([getAllTracks(), getAllSeries()]);
      setAllTracks(t);
      setAllSeries(s);
      setLoading(false);
    }
    loadData();
  }, []);

  const favoriteTracks = allTracks.filter((t) => favorites.includes(t.id));
  const userSavedSeriesList = allSeries.filter((s) => savedSeries.includes(s.id));

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Library Title */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          My Listening Library
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          {user ? `Signed in as ${user.email}` : 'Browsing as Guest (Synced with your browser cache)'}
        </p>
      </div>

      {/* Quick Access Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Link
          href="/library/favorites"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
          <div className="mt-3">
            <span className="text-lg font-bold font-serif text-foreground block">
              {favorites.length}
            </span>
            <span className="text-xs text-foreground-subtle">Favorites</span>
          </div>
        </Link>

        <Link
          href="/playlists"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <ListMusic className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          <div className="mt-3">
            <span className="text-lg font-bold font-serif text-foreground block">
              {playlists.length}
            </span>
            <span className="text-xs text-foreground-subtle">Playlists</span>
          </div>
        </Link>

        <Link
          href="/library/history"
          className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border transition-all flex flex-col justify-between group"
        >
          <History className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          <div className="mt-3">
            <span className="text-lg font-bold font-serif text-foreground block">
              {history.length}
            </span>
            <span className="text-xs text-foreground-subtle">Recent History</span>
          </div>
        </Link>

        <div className="p-4 rounded-2xl bg-background-card border border-background-border flex flex-col justify-between">
          <Bookmark className="w-5 h-5 text-amber-400" />
          <div className="mt-3">
            <span className="text-lg font-bold font-serif text-foreground block">
              {savedSeries.length}
            </span>
            <span className="text-xs text-foreground-subtle">Saved Series</span>
          </div>
        </div>
      </div>

      {/* Recently Played / Progress */}
      {history.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Recent Listening History
            </h2>
            <Link
              href="/library/history"
              className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {history.slice(0, 4).map((item) => {
              const target = allTracks.find((t) => t.id === item.audioId);
              const progressPct =
                item.duration > 0 ? Math.min(100, (item.lastPosition / item.duration) * 100) : 0;
              return (
                <div
                  key={item.audioId}
                  className="p-3.5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border/60 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.trackTitle || target?.title || 'Recording'}
                      </p>
                      <p className="text-[11px] text-foreground-subtle truncate">
                        {item.artistName || target?.artistName || 'SHRUTI'}
                      </p>
                    </div>

                    <button
                      onClick={() => target && playTrack(target, item.lastPosition)}
                      disabled={!target}
                      className="p-2 rounded-full bg-accent text-background hover:bg-accent-hover flex-shrink-0 transition-transform active:scale-95 shadow"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="w-full h-1 bg-background-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-foreground-subtle font-mono mt-1">
                      <span>{formatDuration(item.lastPosition)}</span>
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Favorite Tracks Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
            Favorites ({favoriteTracks.length})
          </h2>
          <Link
            href="/library/favorites"
            className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>All Favorites</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {favoriteTracks.length === 0 ? (
          <div className="py-12 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border">
            You haven&apos;t added any audio tracks to your favorites yet.
          </div>
        ) : (
          <div className="bg-background-card border border-background-border rounded-2xl p-2 divide-y divide-background-border/30">
            {favoriteTracks.slice(0, 5).map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Saved Series Preview */}
      {userSavedSeriesList.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-foreground">
            Saved Series & Collections ({userSavedSeriesList.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSavedSeriesList.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

