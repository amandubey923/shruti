'use client';

import React, { memo, useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Download, Volume2 } from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';
import { getCachedDuration, subscribeDuration, loadDuration } from '@/lib/durationCache';

interface TrackRowProps {
  track: AudioTrack;
  index?: number;
  onPlay?: () => void;
  /** Called when real audio metadata duration is discovered (for parent total recalc) */
  onDurationLoaded?: (trackId: string, duration: number) => void;
}

export const TrackRow = memo(function TrackRow({ track, index, onPlay, onDurationLoaded }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();
  const { isFavorite, toggleFavorite } = useLibrary();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

  // ── Lazy real duration ────────────────────────────────────────────────────────
  // If the track already has a known duration (> 0), use it directly.
  // Otherwise subscribe to durationCache which loads preload="metadata" lazily.
  const needsMetadata = !track.duration || track.duration <= 0;
  const [realDuration, setRealDuration] = useState<number>(() =>
    needsMetadata
      ? (getCachedDuration(track.audioUrl) ?? 0)
      : track.duration
  );

  useEffect(() => {
    if (!needsMetadata) return;
    const url = track.audioUrl;
    if (!url) return;

    // Subscribe first (never miss the resolution event)
    const unsub = subscribeDuration(url, (dur) => {
      setRealDuration(dur);
      onDurationLoaded?.(track.id, dur);
    });

    // Trigger loading (no-op if already in flight or resolved)
    loadDuration(url);

    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.audioUrl]);

  const displayDuration = needsMetadata ? realDuration : track.duration;

  const handlePlayClick = () => {
    if (onPlay) {
      onPlay();
    } else {
      if (isCurrent) {
        togglePlay();
      } else {
        playTrack(track);
      }
    }
  };

  const trackNumStr = index !== undefined
    ? (index + 1).toString().padStart(2, '0')
    : (track.trackNumber || 1).toString().padStart(2, '0');

  return (
    <div
      onClick={handlePlayClick}
      className={`flex items-center justify-between px-3.5 py-3 sm:py-3.5 rounded-2xl transition-all duration-150 group cursor-pointer select-none border ${
        isCurrent
          ? 'bg-accent/10 border-accent/30 shadow-xs'
          : 'bg-background-card/50 hover:bg-background-elevated border-background-border/50 hover:border-background-border'
      }`}
    >
      {/* Left: Index / Play Trigger & Metadata */}
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayClick();
          }}
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-all ${
            isCurrent
              ? 'bg-accent text-stone-950 shadow-sm'
              : 'bg-background-elevated group-hover:bg-accent group-hover:text-stone-950 text-foreground-muted border border-background-border/80'
          }`}
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : isCurrent && !isPlaying ? (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          ) : (
            <>
              <span className="text-xs font-mono font-bold group-hover:hidden">
                {trackNumStr}
              </span>
              <Play className="w-4 h-4 hidden group-hover:block ml-0.5 fill-current" />
            </>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isCurrent && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-accent px-1.5 py-0.2 rounded bg-accent/15 border border-accent/30">
                <Volume2 className="w-3 h-3 animate-pulse" />
                <span>Playing</span>
              </span>
            )}
            <Link
              href={`/track/${track.slug || track.id}`}
              onClick={(e) => e.stopPropagation()}
              className={`text-xs sm:text-sm font-bold truncate block transition-colors ${
                isCurrent ? 'text-accent' : 'text-foreground group-hover:text-accent'
              }`}
            >
              {track.title}
            </Link>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-foreground-subtle truncate mt-0.5">
            {track.artistName && <span className="font-medium text-foreground-muted">{track.artistName}</span>}
            {track.subtitle && (
              <>
                <span>•</span>
                <span className="truncate italic">{track.subtitle}</span>
              </>
            )}
            {track.language && (
              <>
                <span>•</span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-background-elevated rounded text-foreground-subtle border border-background-border/60">
                  {track.language}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Duration & Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 ml-3 flex-shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isFav
              ? 'text-red-500 bg-red-500/10'
              : 'text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100 sm:flex hidden'
          }`}
          title={isFav ? 'Remove Favorite' : 'Save Track'}
          aria-label={isFav ? 'Remove Favorite' : 'Save Track'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {track.isDownloadable && (
          <a
            href={getSupabaseAudioUrl(track.audioUrl)}
            download={`${track.slug || track.id}.mp3`}
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            title="Download MP3"
            aria-label="Download MP3"
          >
            <Download className="w-4 h-4" />
          </a>
        )}

        <span className="text-xs font-mono font-medium text-foreground-muted min-w-[48px] text-right bg-background-elevated/80 px-2 py-1 rounded-md border border-background-border/50">
          {formatDuration(displayDuration)}
        </span>
      </div>
    </div>
  );
});
