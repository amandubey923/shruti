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
  ListPlus,
  ArrowLeft,
  Calendar,
  Clock,
  Layers,
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
      <div className="py-24 text-center text-foreground-subtle text-sm">
        Loading audio discourse...
      </div>
    );
  }

  if (!track) {
    return (
      <div className="py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-foreground">Track Not Found</h2>
        <p className="text-sm text-foreground-subtle">
          This recording may have been moved or removed.
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
        text: `Listen to ${track.title} on SHRUTI`,
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
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <Link
        href={track.seriesId ? `/series/${track.seriesId}` : '/explore'}
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{track.seriesName ? `Back to ${track.seriesName}` : 'Back to Archives'}</span>
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
        <div className="relative w-full sm:w-60 aspect-square rounded-3xl overflow-hidden shadow-2xl bg-background-elevated flex-shrink-0 border border-background-border/80 group">
          {coverUrl && (
            <Image
              src={coverUrl}
              alt={track.title}
              fill
              sizes="(max-width: 640px) 100vw, 240px"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent px-2 py-0.5 rounded bg-accent/15 border border-accent/30">
                {track.category}
              </span>
              {track.seriesName && (
                <Link
                  href={`/series/${track.seriesId || ''}`}
                  className="text-xs text-foreground-subtle hover:text-accent transition-colors flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{track.seriesName}</span>
                </Link>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {track.title}
            </h1>

            {track.subtitle && (
              <p className="text-sm text-foreground-muted italic">{track.subtitle}</p>
            )}

            <p className="text-xs text-foreground-subtle">
              Speaker / Artist:{' '}
              <span className="font-medium text-foreground">{track.artistName || 'SHRUTI Master'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-subtle py-1">
            <div className="flex items-center gap-1.5 font-mono">
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
              <span className="px-2 py-0.5 bg-background-elevated border border-background-border rounded text-[11px]">
                {track.language}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-background font-semibold text-xs sm:text-sm shadow-md shadow-accent/20 transition-all active:scale-95"
            >
              {isCurrent && isPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Recording</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>Play Discourse</span>
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
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>

            {track.isDownloadable && (
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-full border border-background-border text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors"
                title="Download Recording"
              >
                <Download className="w-4 h-4" />
              </button>
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

      {track.description && (
        <div className="space-y-3 p-6 rounded-3xl bg-background-card border border-background-border">
          <h3 className="font-serif text-base font-bold text-foreground">
            Discourse Notes & Contemplations
          </h3>
          <p className="text-xs sm:text-sm text-foreground-muted leading-relaxed whitespace-pre-line">
            {track.description}
          </p>

          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-background-border/40">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md bg-background-elevated text-[11px] text-foreground-subtle font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {relatedTracks.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-background-border/60">
          <h3 className="font-serif text-lg font-bold text-foreground">
            More from this Archive
          </h3>
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
