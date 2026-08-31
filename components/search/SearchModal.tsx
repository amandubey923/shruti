'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Play, Mic, Layers, User, ArrowRight } from 'lucide-react';
import { AudioTrack, Series, Artist } from '@/types/audio';
import { getAllTracks, getAllSeries, getAllArtists } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { formatDuration, resolveTrackCover } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
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
        s.subtitle?.toLowerCase().includes(q) ||
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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-background border border-background-border rounded-3xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[85vh]">
        <div className="p-4 sm:p-5 border-b border-background-border flex items-center gap-3">
          <Search className="w-5 h-5 text-accent flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search discourses, series, Upanishads, speakers..."
            className="w-full bg-transparent text-sm sm:text-base font-medium text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="w-8 h-8 flex items-center justify-center text-foreground-subtle hover:text-foreground rounded-full hover:bg-background-elevated"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold px-3 py-1.5 bg-background-elevated hover:bg-background-hover text-foreground-muted rounded-xl border border-background-border"
          >
            Esc
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {query.trim() === '' ? (
            <div className="py-10 text-center">
              <p className="text-xs sm:text-sm text-foreground-subtle">
                Try searching <span className="text-accent font-bold">&quot;Krishna&quot;</span>,{' '}
                <span className="text-accent font-bold">&quot;Mahaveer&quot;</span>,{' '}
                <span className="text-accent font-bold">&quot;Ek Omkar&quot;</span>, or{' '}
                <span className="text-accent font-bold">&quot;Upanishad&quot;</span>
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-foreground-subtle space-y-1">
              <p className="text-sm sm:text-base font-bold text-foreground">No recordings found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-foreground-subtle">Try searching by series name, speaker, or category.</p>
            </div>
          ) : (
            <>
              {/* Series Results */}
              {filteredResults.series.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Books &amp; Series</span>
                  </h4>
                  <div className="space-y-1.5">
                    {filteredResults.series.map((s) => (
                      <Link
                        key={s.id}
                        href={`/series/${s.slug || s.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-2xl bg-background-card/60 hover:bg-background-elevated border border-background-border/50 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border/80">
                            {s.coverImage && (
                              <Image
                                src={s.coverImage}
                                alt={s.title}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                              {s.title}
                            </p>
                            <p className="text-[11px] font-medium text-foreground-subtle truncate mt-0.5">
                              {s.artistName} • {s.totalTracks} Parts
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-foreground-subtle group-hover:text-accent ml-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Discourses & Audio Results */}
              {filteredResults.tracks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Discourses &amp; Audio</span>
                  </h4>
                  <div className="space-y-1.5">
                    {filteredResults.tracks.map((track) => {
                      const cover = resolveTrackCover(track);
                      return (
                        <div
                          key={track.id}
                          className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-background-card/60 hover:bg-background-elevated border border-background-border/50 transition-all group"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              playTrack(track);
                              onClose();
                            }}
                            className="flex items-center gap-3.5 text-left flex-1 min-w-0"
                          >
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border/80">
                              {cover ? (
                                <Image
                                  src={cover}
                                  alt={track.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-accent">
                                  <Play className="w-4 h-4 fill-current" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                                {track.title}
                              </p>
                              <p className="text-[11px] font-medium text-foreground-subtle truncate mt-0.5">
                                {track.artistName || track.seriesName || 'SHRUTI Archive'}
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-2.5 ml-2 flex-shrink-0">
                            <span className="text-[11px] font-mono font-semibold text-foreground-subtle px-2 py-0.5 rounded bg-background-elevated border border-background-border/50">
                              {formatDuration(track.duration)}
                            </span>
                            <Link
                              href={`/track/${track.slug || track.id}`}
                              onClick={onClose}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-foreground-subtle hover:text-accent hover:bg-background-elevated transition-colors"
                              title="View Audio Details"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Speakers */}
              {filteredResults.artists.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Speakers</span>
                  </h4>
                  <div className="space-y-1.5">
                    {filteredResults.artists.map((a) => (
                      <Link
                        key={a.id}
                        href={`/artist/${a.slug || a.id}`}
                        onClick={onClose}
                        className="flex items-center justify-between p-3 rounded-2xl bg-background-card/60 hover:bg-background-elevated border border-background-border/50 transition-all group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border">
                            {a.image && (
                              <Image
                                src={a.image}
                                alt={a.name}
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-accent transition-colors">
                              {a.name}
                            </p>
                            <p className="text-[11px] font-medium text-foreground-subtle truncate mt-0.5">
                              {a.role}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-foreground-subtle group-hover:text-accent ml-2" />
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
