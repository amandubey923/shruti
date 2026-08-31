'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Shuffle,
  Bookmark,
  Share2,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { Series, AudioTrack } from '@/types/audio';
import { getSeriesById, getTracksForSeries } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { TrackRow } from '@/components/audio/TrackRow';
import { formatDurationHuman } from '@/lib/utils';

export default function SeriesDetailPage() {
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [series, setSeries] = useState<Series | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { playSeriesAll } = usePlayback();
  const { isSeriesSaved, toggleSaveSeries } = useLibrary();

  useEffect(() => {
    async function loadSeries() {
      if (!seriesId) return;
      const s = await getSeriesById(seriesId);
      if (s) {
        setSeries(s);
        const t = await getTracksForSeries(s.id);
        setTracks(t);
      }
      setLoading(false);
    }
    loadSeries();
  }, [seriesId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-foreground-subtle text-sm">
        Loading series archive...
      </div>
    );
  }

  if (!series) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Series Not Found</h2>
        <p className="text-sm text-foreground-subtle">
          The requested series may have been archived or removed.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold rounded-full text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const isSaved = isSeriesSaved(series.id);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playSeriesAll(tracks, 0);
    }
  };

  const handleShuffleAll = () => {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playSeriesAll(shuffled, 0);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: series.title,
        text: `Explore ${series.title} on SHRUTI`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto">
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden shadow-2xl bg-background-elevated flex-shrink-0 border border-background-border/80">
          {series.coverImage ? (
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent">
              <Layers className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent px-2 py-0.5 rounded bg-accent/15 border border-accent/30">
                {series.category}
              </span>
              {series.language && (
                <span className="text-[10px] uppercase font-mono text-foreground-subtle">
                  {series.language}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {series.title}
            </h1>

            {series.subtitle && (
              <p className="text-sm sm:text-base text-foreground-muted italic">
                {series.subtitle}
              </p>
            )}

            <p className="text-xs sm:text-sm text-foreground-subtle font-medium">
              By{' '}
              <Link
                href={`/artist/${series.artistId || series.artistName.toLowerCase()}`}
                className="text-foreground hover:text-accent underline underline-offset-4 transition-colors"
              >
                {series.artistName}
              </Link>{' '}
              • {tracks.length} Parts • {formatDurationHuman(series.totalDuration)}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-2xl">
            {series.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs sm:text-sm shadow-md shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All</span>
            </button>

            <button
              onClick={handleShuffleAll}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-background-elevated hover:bg-background-hover text-foreground font-medium text-xs border border-background-border transition-colors disabled:opacity-50"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              onClick={() => toggleSaveSeries(series.id)}
              className={`p-2.5 rounded-full border transition-colors ${
                isSaved
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Series'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors relative"
              title="Share Series"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-background rounded text-[10px] font-semibold whitespace-nowrap shadow">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-background-border/60">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Discourse Parts & Recordings ({tracks.length})
          </h3>
          <span className="text-xs font-mono text-foreground-subtle">
            Total {formatDurationHuman(series.totalDuration)}
          </span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-12 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border">
            No audio tracks in this collection yet.
          </div>
        ) : (
          <div className="bg-background-card border border-background-border rounded-2xl p-2 sm:p-3 divide-y divide-background-border/30">
            {tracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                onPlay={() => playSeriesAll(tracks, idx)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
