'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Compass, Clock, ArrowRight } from 'lucide-react';
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
    <div className="space-y-12 sm:space-y-16 animate-fade-in pb-12">
      {/* Editorial Archival Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-background-elevated/90 to-background-card border border-background-border p-6 sm:p-10 lg:p-14 shadow-sm">
        <div className="max-w-3xl relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spoken Audio Archive</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.12] tracking-tight">
            Listen. Contemplate. Return.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-foreground-muted leading-relaxed max-w-2xl font-normal">
            A sanctuary for long-form spiritual discourses, timeless philosophical commentaries,
            Upanishadic dialogues, and meditation audio recordings.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            {featuredSeries && (
              <button
                type="button"
                onClick={() => {
                  const sTracks = tracks.filter((t) => t.seriesId === featuredSeries.id);
                  playSeriesAll(sTracks, 0);
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-accent/25 active:scale-95 min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Listen to {featuredSeries.title}</span>
              </button>
            )}

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background-elevated hover:bg-background-hover text-foreground font-semibold text-xs sm:text-sm border border-background-border transition-all min-h-[44px]"
            >
              <Compass className="w-4 h-4 text-accent" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial-gradient from-accent/10 to-transparent pointer-events-none opacity-40" />
      </section>

      {/* Continue Listening Banner */}
      {lastProgress && (
        <section className="bg-accent/10 border border-accent/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-up shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-accent text-stone-950 flex items-center justify-center flex-shrink-0 shadow-md">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
                Continue Listening
              </span>
              <p className="text-sm sm:text-base font-bold text-foreground truncate mt-0.5">
                {lastProgress.trackTitle}
              </p>
              <p className="text-xs text-foreground-muted mt-0.5">
                Resuming from {formatDuration(lastProgress.lastPosition)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResumeLast}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm rounded-full shadow-md shadow-accent/25 transition-all active:scale-95 min-h-[44px]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>
        </section>
      )}

      {/* Featured Collection Spotlight */}
      {featuredSeries && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
                Featured Collection
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
                Master Audio Discourses
              </h2>
            </div>
            <Link
              href={`/series/${featuredSeries.slug || featuredSeries.id}`}
              className="text-xs sm:text-sm text-accent hover:text-accent-hover font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All Parts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <SeriesCard series={featuredSeries} featured />
        </section>
      )}

      {/* Available Audio Series / Books */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
              Collections &amp; Series
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              Available Books &amp; Series
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>All Series</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((series) => (
            <SeriesCard key={series.id} series={series} />
          ))}
        </div>
      </section>

      {/* Standalone Audio Recordings */}
      {standaloneAudio.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
                Individual Recordings
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
                Standalone Audio &amp; Meditations
              </h2>
            </div>
            <Link
              href="/explore"
              className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {standaloneAudio.map((track) => (
              <AudioCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}

      {/* Explore Archive Categories */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-accent">
              Themes of Inquiry
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-foreground">
              Browse Categories
            </h2>
          </div>
          <Link
            href="/explore"
            className="text-xs sm:text-sm text-foreground-muted hover:text-accent font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>
    </div>
  );
}
