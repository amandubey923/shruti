'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Sparkles, Compass, Clock, ArrowRight } from 'lucide-react';
import { AudioTrack, Series, CategoryInfo } from '@/types/audio';
import { PlaybackProgress } from '@/types/user';
import {
  getAllTracks,
  getAllSeries,
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
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [lastProgress, setLastProgress] = useState<PlaybackProgress | null>(null);
  const [showAllMobileSeries, setShowAllMobileSeries] = useState(false);

  const { playTrack, playSeriesAll } = usePlayback();

  useEffect(() => {
    async function loadContent() {
      const [allT, allS] = await Promise.all([
        getAllTracks(),
        getAllSeries(),
      ]);
      setTracks(allT);
      setSeriesList(allS);
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
      } catch (err) {
        console.error('Error loading resume progress:', err);
      }
    }
    loadContent();
  }, []);

  const handleResumeLast = () => {
    if (!lastProgress) return;
    const track = tracks.find((t) => t.id === lastProgress.audioId);
    if (track) {
      playTrack(track, lastProgress.lastPosition);
    }
  };

  const featuredSeries = seriesList.find((s) => s.id === 'krishna-smriti') || seriesList[0];
  const standaloneAudio = tracks.filter((t) => !t.seriesId).slice(0, 4);

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Editorial Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background-card via-background-elevated to-background-card border border-background-border/80 p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Spoken Audio Sanctuary</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Listen. Contemplate. <span className="text-accent italic font-normal">Awaken.</span>
          </h1>

          <p className="text-foreground-muted text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
            A dedicated archival haven for authentic spoken audio — complete Osho discourse series, Upanishadic commentaries, and profound philosophical recordings.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3 sm:gap-4">
            {featuredSeries && (
              <button
                type="button"
                onClick={() => {
                  const fTracks = tracks.filter((t) => t.seriesId === featuredSeries.id);
                  if (fTracks.length > 0) playSeriesAll(fTracks);
                }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-accent/20 transition-all active:scale-95 group min-h-[44px]"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>Begin Archive Journey</span>
              </button>
            )}

            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-background-surface hover:bg-background-hover text-foreground font-semibold text-xs sm:text-sm rounded-full border border-background-border transition-all active:scale-95 min-h-[44px]"
            >
              <Compass className="w-4 h-4 text-accent" />
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>

        {/* Subtle Decorative Geometry */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-accent/10 pointer-events-none hidden lg:block" />
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full border border-accent/15 pointer-events-none hidden lg:block" />
      </section>

      {/* Resume Progress Card */}
      {lastProgress && (
        <section className="bg-background-elevated/90 border border-accent/30 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
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

        {/* 2-column mobile grid, 2-column tablet, 3-column desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {seriesList.map((series, idx) => (
            <div
              key={series.id}
              className={idx >= 4 && !showAllMobileSeries ? 'hidden sm:block h-full' : 'block h-full'}
            >
              <SeriesCard series={series} />
            </div>
          ))}
        </div>

        {/* Mobile View More button */}
        {!showAllMobileSeries && seriesList.length > 4 && (
          <div className="sm:hidden pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllMobileSeries(true)}
              className="w-full py-2.5 px-4 bg-background-elevated hover:bg-background-hover border border-background-border rounded-xl text-xs font-bold text-accent transition-all active:scale-95 text-center flex items-center justify-center gap-2 shadow-xs"
            >
              <span>View More Series ({seriesList.length - 4} More)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
