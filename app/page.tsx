'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Play, Sparkles, Compass, Clock, ArrowRight, BookOpen, Mic, User } from 'lucide-react';
import { AudioTrack, Series, Artist, CategoryInfo } from '@/types/audio';
import { PlaybackProgress } from '@/types/user';
import {
  getAllTracks,
  getAllSeries,
  getAllArtists,
  getAllCategories,
} from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { AudioCard } from '@/components/audio/AudioCard';
import { SeriesCard } from '@/components/audio/SeriesCard';
import { CategoryCard } from '@/components/audio/CategoryCard';
import { formatDuration } from '@/lib/utils';

export default function HomePage() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [lastProgress, setLastProgress] = useState<PlaybackProgress | null>(null);

  const { playTrack, playSeriesAll } = usePlayback();

  useEffect(() => {
    async function loadContent() {
      const [allT, allS, allA] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
        getAllArtists(),
      ]);
      setTracks(allT);
      setSeriesList(allS);
      setArtists(allA);
      setCategories(getAllCategories());

      try {
        const raw = localStorage.getItem('shruti_playback_progress');
        if (raw) {
          const map: Record<string, PlaybackProgress> = JSON.parse(raw);
          const entries = Object.values(map).sort(
            (a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
          );
          if (entries.length > 0 && !entries[0].completed && entries[0].lastPosition > 10) {
            setLastProgress(entries[0]);
          }
        }
      } catch (e) {
        console.warn('Could not read last progress', e);
      }
    }
    loadContent();
  }, []);

  const featuredSeries = seriesList.find((s) => s.featured) || seriesList[0];
  const standaloneAudio = tracks.filter((t) => !t.seriesId);

  const handleResumeLast = () => {
    if (!lastProgress) return;
    const target = tracks.find((t) => t.id === lastProgress.audioId);
    if (target) {
      playTrack(target, lastProgress.lastPosition);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Editorial Archival Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-background-elevated/90 to-background-card border border-background-border/80 p-6 sm:p-10 lg:p-12">
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spoken Audio Archive</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.15] tracking-tight">
            Listen. Contemplate. Return.
          </h1>

          <p className="text-sm sm:text-base text-foreground-muted leading-relaxed max-w-2xl">
            A dedicated listening archive for long-form spiritual discourses, timeless philosophical commentaries,
            Upanishadic dialogues, and meditation recordings.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {featuredSeries && (
              <button
                onClick={() => {
                  const sTracks = tracks.filter((t) => t.seriesId === featuredSeries.id);
                  playSeriesAll(sTracks, 0);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs sm:text-sm transition-all shadow-md shadow-accent/20 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Listen to {featuredSeries.title}</span>
              </button>
            )}

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-background-elevated hover:bg-background-hover text-foreground font-medium text-xs sm:text-sm border border-background-border transition-colors"
            >
              <Compass className="w-4 h-4 text-accent" />
              <span>Browse Archive</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial-gradient from-accent/10 to-transparent pointer-events-none opacity-50" />
      </section>

      {/* Continue Listening Banner */}
      {lastProgress && (
        <section className="bg-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center justify-between gap-4 animate-slide-up">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-accent text-background flex items-center justify-center flex-shrink-0 shadow-md">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-accent">
                Continue Listening
              </span>
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {lastProgress.trackTitle}
              </p>
              <p className="text-[11px] text-foreground-subtle">
                Resuming from {formatDuration(lastProgress.lastPosition)}
              </p>
            </div>
          </div>

          <button
            onClick={handleResumeLast}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background font-semibold text-xs rounded-full shadow transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Resume</span>
          </button>
        </section>
      )}

      {/* Featured Series Spotlight */}
      {featuredSeries && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-accent">
                Featured Collection
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Master Audio Discourses
              </h2>
            </div>
            <Link
              href={`/series/${featuredSeries.slug || featuredSeries.id}`}
              className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Parts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <SeriesCard series={featuredSeries} featured />
        </section>
      )}

      {/* Available Audio Series / Books */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-accent">
              Collections &amp; Series
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Available Books &amp; Series
            </h2>
          </div>
          <Link
            href="/explore?tab=series"
            className="text-xs text-foreground-muted hover:text-accent font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>All Series</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* Standalone Audio Recordings */}
      {standaloneAudio.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-accent">
                Individual Recordings
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Standalone Audio &amp; Meditations
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs text-foreground-muted hover:text-accent font-medium inline-flex items-center gap-1 transition-colors"
            >
              <span>View Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {standaloneAudio.map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Archive Categories */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-accent">
              Themes of Inquiry
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
              Browse Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs text-foreground-muted hover:text-accent font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* Speaker Section (Real Speaker Only) */}
      {artists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-accent">
                Speaker &amp; Author
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Voices of the Archive
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.slug || artist.id}`}
                className="p-5 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border/60 hover:border-accent/40 transition-all flex items-center gap-4 group"
              >
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border">
                  {artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      fill
                      sizes="64px"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-foreground-subtle">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-base font-bold text-foreground group-hover:text-accent transition-colors truncate">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-foreground-subtle truncate mt-0.5">
                    {artist.role || 'Speaker'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-accent/90 font-mono mt-1.5">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {artist.seriesCount || 0} Series
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      {artist.trackCount || 0} Discourses
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
