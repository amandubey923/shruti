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
  Clock,
  Sparkles,
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
      <div className="py-24 text-center text-foreground-subtle text-sm animate-pulse">
        Accessing discourse archives...
      </div>
    );
  }

  if (!series) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Series Not Found</h2>
        <p className="text-xs sm:text-sm text-foreground-subtle">
          The requested series may have been archived or is not present in storage.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-stone-950 font-bold rounded-full text-xs shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>
    );
  }

  const isSaved = isSeriesSaved(series.id);
  const totalSecs = tracks.reduce((acc, t) => acc + (t.duration || 0), 0) || series.totalDuration;

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
        text: `Listen to ${series.title} on SHRUTI Audio Archive`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Back link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 text-accent group-hover:-translate-x-0.5 transition-transform" />
        <span>Return to Catalog</span>
      </Link>

      {/* Series Hero Card */}
      <div className="bg-background-card border border-background-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 items-start">
        {/* Visual Cover */}
        <div className="relative w-full md:w-72 aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-background-elevated flex-shrink-0 border border-background-border/80">
          {series.coverImage ? (
            <Image
              src={series.coverImage}
              alt={series.title}
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent">
              <Layers className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Series Metadata & Actions */}
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
                {series.category}
              </span>
              {series.language && (
                <span className="text-[10px] uppercase font-mono font-semibold text-foreground-subtle px-2.5 py-1 rounded-full bg-background-elevated border border-background-border">
                  {series.language}
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight">
              {series.title}
            </h1>

            {series.subtitle && (
              <p className="text-sm sm:text-base text-foreground-muted italic font-serif">
                {series.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-foreground-subtle font-medium">
              <span>Speaker:</span>
              <Link
                href={`/artist/${series.artistId || series.artistName.toLowerCase()}`}
                className="text-foreground font-bold hover:text-accent underline underline-offset-4 transition-colors"
              >
                {series.artistName}
              </Link>
              <span>•</span>
              <span className="text-foreground-muted font-semibold">{tracks.length} Parts</span>
              <span>•</span>
              <div className="inline-flex items-center gap-1 text-foreground-muted font-semibold">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>{formatDurationHuman(totalSecs)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed max-w-2xl font-normal">
            {series.description}
          </p>

          {/* Action CTAs with generous hit area */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-accent/25 transition-all active:scale-95 disabled:opacity-50 min-h-[44px]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play All Parts</span>
            </button>

            <button
              type="button"
              onClick={handleShuffleAll}
              disabled={tracks.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-background-elevated hover:bg-background-hover text-foreground font-semibold text-xs sm:text-sm border border-background-border transition-colors disabled:opacity-50 min-h-[44px]"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>

            <button
              type="button"
              onClick={() => toggleSaveSeries(series.id)}
              className={`w-11 h-11 rounded-full border transition-all flex items-center justify-center ${
                isSaved
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Series'}
              aria-label={isSaved ? 'Remove from Saved' : 'Save Series'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="w-11 h-11 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors flex items-center justify-center relative"
              title="Share Series"
              aria-label="Share Series"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-accent text-stone-950 rounded text-[10px] font-bold whitespace-nowrap shadow-lg">
                  Copied!
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Parts List */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-foreground">
              Discourse Recordings ({tracks.length})
            </h3>
          </div>
          <span className="text-xs font-mono font-semibold text-foreground-muted bg-background-elevated px-3 py-1 rounded-full border border-background-border/60">
            Total {formatDurationHuman(totalSecs)}
          </span>
        </div>

        {tracks.length === 0 ? (
          <div className="py-16 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border">
            No audio tracks in this collection yet.
          </div>
        ) : (
          <div className="bg-background-card/60 border border-background-border rounded-3xl p-2 sm:p-4 space-y-2">
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
