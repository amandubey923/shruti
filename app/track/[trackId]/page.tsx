'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { getTrackById, getAllTracks } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration, formatDate, resolveTrackCover } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';
import { AudioCard } from '@/components/audio/AudioCard';

export default function TrackDetailPage() {
  const params = useParams();
  const trackId = params.trackId as string;

  const [track, setTrack] = useState<AudioTrack | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();
  const { isFavorite, toggleFavorite } = useLibrary();

  useEffect(() => {
    async function loadTrack() {
      if (!trackId) return;
      const t = await getTrackById(trackId);
      if (t) {
        setTrack(t);
        const all = await getAllTracks();
        const related = all
          .filter((item) => item.id !== t.id && (item.seriesId === t.seriesId || item.category === t.category))
          .slice(0, 4);
        setRelatedTracks(related);
      }
      setLoading(false);
    }
    loadTrack();
  }, [trackId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-foreground-subtle text-sm animate-pulse">
        Loading audio discourse...
      </div>
    );
  }

  if (!track) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">Recording Not Found</h2>
        <p className="text-xs sm:text-sm text-foreground-subtle">
          This recording may have been moved or is not present in storage.
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

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);
  const coverUrl = resolveTrackCover(track);

  const handlePlayToggle = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Listen to ${track.title} on SHRUTI Audio Archive`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!track.isDownloadable) return;
    const link = document.createElement('a');
    link.href = getSupabaseAudioUrl(track.audioUrl);
    link.download = `${track.slug || track.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto pb-16">
      <Link
        href={track.seriesId ? `/series/${track.seriesId}` : '/explore'}
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground-muted hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 text-accent group-hover:-translate-x-0.5 transition-transform" />
        <span>{track.seriesName ? `Return to ${track.seriesName}` : 'Back to Catalog'}</span>
      </Link>

      <div className="bg-background-card border border-background-border rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm flex flex-col sm:flex-row gap-6 sm:gap-10 items-start">
        <div className="relative w-full sm:w-64 aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-background-elevated flex-shrink-0 border border-background-border/80 group">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={track.title}
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent px-3 py-1 rounded-full bg-accent/15 border border-accent/30">
                {track.category}
              </span>
              {track.seriesName && (
                <Link
                  href={`/series/${track.seriesId || ''}`}
                  className="text-xs font-semibold text-foreground-muted hover:text-accent transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-elevated border border-background-border"
                >
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>{track.seriesName}</span>
                </Link>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-tight">
              {track.title}
            </h1>

            {track.subtitle && (
              <p className="text-sm sm:text-base text-foreground-muted italic font-serif">{track.subtitle}</p>
            )}

            <p className="text-xs sm:text-sm text-foreground-subtle font-medium">
              Speaker:{' '}
              <span className="font-bold text-foreground">{track.artistName || 'SHRUTI Master'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground-subtle py-1">
            <div className="flex items-center gap-1.5 font-mono text-foreground-muted font-semibold">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{formatDuration(track.duration)}</span>
            </div>

            {track.releaseDate && (
              <div className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>{formatDate(track.releaseDate)}</span>
              </div>
            )}

            {track.language && (
              <span className="px-2.5 py-0.5 bg-background-elevated border border-background-border rounded-md text-[11px] font-mono uppercase font-semibold text-foreground-subtle">
                {track.language}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-accent hover:bg-accent-hover text-stone-950 font-bold text-xs sm:text-sm shadow-md shadow-accent/25 transition-all active:scale-95 min-h-[44px]"
            >
              {isCurrent && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Recording</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Listen to Discourse</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => toggleFavorite(track.id)}
              className={`w-11 h-11 rounded-full border transition-all flex items-center justify-center ${
                isFav
                  ? 'border-red-500/40 bg-red-500/10 text-red-500'
                  : 'border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated'
              }`}
              title={isFav ? 'Remove Favorite' : 'Save Track'}
              aria-label={isFav ? 'Remove Favorite' : 'Save Track'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {track.isDownloadable && (
              <button
                type="button"
                onClick={handleDownload}
                className="w-11 h-11 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors flex items-center justify-center"
                title="Download MP3"
                aria-label="Download MP3"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-11 h-11 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors flex items-center justify-center relative"
              title="Share Recording"
              aria-label="Share Recording"
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

      {/* Description & Contemplative Notes */}
      {track.description && (
        <div className="bg-background-card/60 border border-background-border rounded-3xl p-6 sm:p-8 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-serif text-lg font-bold text-foreground">
              Discourse Overview &amp; Context
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed font-normal">
            {track.description}
          </p>
        </div>
      )}

      {/* Related Recordings */}
      {relatedTracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-foreground">
              More From This Collection
            </h3>
            {track.seriesId && (
              <Link
                href={`/series/${track.seriesId}`}
                className="text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                View Full Series
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTracks.map((rel) => (
              <AudioCard key={rel.id} track={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
