'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  Heart,
  Download,
  Share2,
  Music,
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
} from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { getTrackById, getAllTracks } from '@/lib/firestore';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { AudioCard } from '@/components/audio/AudioCard';
import { formatDuration, formatDate } from '@/lib/utils';

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
    async function loadTrackData() {
      if (!trackId) return;
      const t = await getTrackById(trackId);
      if (t) {
        setTrack(t);
        const all = await getAllTracks();
        // Related tracks from same category or series
        const related = all
          .filter((item) => item.id !== t.id && (item.seriesId === t.seriesId || item.category === t.category))
          .slice(0, 4);
        setRelatedTracks(related);
      }
      setLoading(false);
    }
    loadTrackData();
  }, [trackId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-foreground-subtle text-sm">
        Loading track details...
      </div>
    );
  }

  if (!track) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Track Not Found</h2>
        <p className="text-sm text-foreground-subtle">
          The requested recording could not be found.
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

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

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
        text: `Listen to ${track.title} on SHRUTI`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in">
      {/* Back Link */}
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </Link>

      {/* Main Track Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Cover Art */}
        <div className="relative w-full md:w-72 aspect-square rounded-3xl overflow-hidden shadow-2xl bg-background-elevated flex-shrink-0 border border-background-border/80">
          {track.coverImage ? (
            <Image
              src={track.coverImage}
              alt={track.title}
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent">
              <Music className="w-16 h-16" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent px-2 py-0.5 rounded bg-accent/15 border border-accent/30">
                {track.category}
              </span>
              {track.seriesName && (
                <Link
                  href={`/series/${track.seriesId || ''}`}
                  className="text-xs text-foreground-subtle hover:text-accent flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{track.seriesName}</span>
                </Link>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {track.title}
            </h1>

            {track.subtitle && (
              <p className="text-sm sm:text-base text-foreground-muted italic">
                {track.subtitle}
              </p>
            )}

            <p className="text-xs sm:text-sm text-foreground-muted font-medium">
              By{' '}
              <Link
                href={`/artist/${track.artistId || ''}`}
                className="text-foreground hover:text-accent underline underline-offset-4 transition-colors"
              >
                {track.artistName || 'SHRUTI Master Recording'}
              </Link>
            </p>
          </div>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-subtle border-y border-background-border/60 py-3">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{formatDuration(track.duration)}</span>
            </div>

            {track.releaseDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>{formatDate(track.releaseDate)}</span>
              </div>
            )}

            {track.language && (
              <span className="text-[11px] px-2 py-0.5 bg-background-elevated rounded border border-background-border uppercase font-mono">
                {track.language}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs sm:text-sm shadow-md shadow-accent/20 transition-all active:scale-95"
            >
              {isCurrent && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Recording</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Listen Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => toggleFavorite(track.id)}
              className={`p-2.5 rounded-full border transition-colors ${
                isFav
                  ? 'border-red-500/40 bg-red-500/10 text-red-400'
                  : 'border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated'
              }`}
              title={isFav ? 'Remove Favorite' : 'Add Favorite'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {track.isDownloadable && (
              <a
                href={track.audioUrl}
                download={`${track.slug || track.id}.mp3`}
                className="p-2.5 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors"
                title="Download Audio File"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors relative"
              title="Share Recording"
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

      {/* Description & Reflection Notes */}
      {track.description && (
        <div className="bg-background-card border border-background-border rounded-2xl p-6 space-y-2">
          <h3 className="font-serif text-base font-bold text-foreground">
            Discourse Notes & Context
          </h3>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
            {track.description}
          </p>

          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-3">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 bg-background-elevated text-foreground-subtle rounded-md border border-background-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Tracks */}
      {relatedTracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <h3 className="font-serif text-lg font-bold text-foreground">
            Related Contemplations & Audio
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTracks.map((item) => (
              <AudioCard key={item.id} track={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

