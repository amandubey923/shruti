'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Play, Music, Layers, User, ArrowRight } from 'lucide-react';
import { AudioTrack, Series, Artist } from '@/types/audio';
import { getAllTracks, getAllSeries, getAllArtists } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { formatDuration } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack } = usePlayback();

  useEffect(() => {
    async function loadData() {
      const [t, s, a] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
        getAllArtists(),
      ]);
      setTracks(t);
      setSeriesList(s);
      setArtists(a);
      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { tracks: [], series: [], artists: [] };

    const matchedTracks = tracks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artistName?.toLowerCase().includes(q) ||
        t.seriesName?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.description?.toLowerCase().includes(q) ||
        t.language?.toLowerCase().includes(q)
    );

    const matchedSeries = seriesList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artistName?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some((tag) => tag.toLowerCase().includes(q))
    );

    const matchedArtists = artists.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q) ||
        a.bio?.toLowerCase().includes(q)
    );

    return {
      tracks: matchedTracks.slice(0, 8),
      series: matchedSeries.slice(0, 4),
      artists: matchedArtists.slice(0, 4),
    };
  }, [query, tracks, seriesList, artists]);

  const hasResults =
    filteredResults.tracks.length > 0 ||
    filteredResults.series.length > 0 ||
    filteredResults.artists.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-background-surface border border-background-border rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-background-border/60 flex items-center gap-3">
          <Search className="w-5 h-5 text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discourses, series, ragas, speakers..."
            className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-foreground-subtle hover:text-foreground rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-background-elevated hover:bg-background-hover text-foreground-muted rounded-md border border-background-border"
          >
            Esc
          </button>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {query.trim() === '' ? (
            <div className="py-8 text-center">
              <p className="text-xs text-foreground-subtle">
                Type keywords like <span className="text-accent font-medium">&quot;Krishna&quot;</span>,{' '}
                <span className="text-accent font-medium">&quot;Osho&quot;</span>,{' '}
                <span className="text-accent font-medium">&quot;Raga&quot;</span>, or{' '}
                <span className="text-accent font-medium">&quot;Meditation&quot;</span>
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-foreground-subtle">
              <p className="text-sm">No audio or speakers found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs mt-1 text-foreground-subtle/80">Try exploring by categories or speakers.</p>
            </div>
          ) : (
            <>
              {/* Tracks Section */}
              {filteredResults.tracks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle mb-2.5 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-accent" />
                    <span>Audio Tracks</span>
                  </h4>
                  <div className="space-y-1">
                    {filteredResults.tracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-background-hover transition-colors group"
                      >
                        <button
                          onClick={() => {
                            playTrack(track);
                            onClose();
                          }}
                          className="flex items-center gap-3 text-left flex-1 min-w-0"
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-background-elevated">
                            {track.coverImage ? (
                              <Image
                                src={track.coverImage}
                                alt={track.title}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-accent">
                                <Play className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                              {track.title}
                            </p>
                            <p className="text-[11px] text-foreground-subtle truncate">
                              {track.artistName || track.seriesName || 'SHRUTI Archive'}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-[10px] font-mono text-foreground-subtle">
                            {formatDuration(track.duration)}
                          </span>
                          <Link
                            href={`/track/${track.slug || track.id}`}
                            onClick={onClose}
                            className="p-1.5 text-foreground-subtle hover:text-accent transition-colors"
                            title="View Track"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Series Section */}
              {filteredResults.series.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    <span>Collections & Series</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredResults.series.map((s) => (
                      <Link
                        key={s.id}
                        href={`/series/${s.slug || s.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-background-elevated/40 hover:bg-background-hover border border-background-border/40 transition-colors group"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-background-surface">
                          {s.coverImage && (
                            <Image
                              src={s.coverImage}
                              alt={s.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                            {s.title}
                          </p>
                          <p className="text-[10px] text-foreground-subtle">
                            {s.totalTracks} Parts • {s.artistName}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Speakers & Artists Section */}
              {filteredResults.artists.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle mb-2.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span>Speakers & Artists</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredResults.artists.map((a) => (
                      <Link
                        key={a.id}
                        href={`/artist/${a.slug || a.id}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-background-elevated/40 hover:bg-background-hover border border-background-border/40 transition-colors group"
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-background-surface">
                          {a.image && (
                            <Image
                              src={a.image}
                              alt={a.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate group-hover:text-accent transition-colors">
                            {a.name}
                          </p>
                          <p className="text-[10px] text-foreground-subtle truncate">
                            {a.role || 'Speaker'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

