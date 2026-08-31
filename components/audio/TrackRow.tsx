'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Pause, Heart, Download } from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';

interface TrackRowProps {
  track: AudioTrack;
  index?: number;
  onPlay?: () => void;
}

export function TrackRow({ track, index, onPlay }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();
  const { isFavorite, toggleFavorite } = useLibrary();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);

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

  return (
    <div
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group select-none ${
        isCurrent
          ? 'bg-accent/10 border border-accent/20'
          : 'hover:bg-background-hover/60 border border-transparent'
      }`}
    >
      {/* Left: Index / Play Trigger & Details */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <button
          onClick={handlePlayClick}
          className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-foreground-subtle group-hover:text-accent hover:bg-background-elevated transition-colors"
          aria-label={isCurrent && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 text-accent fill-current" />
          ) : isCurrent && !isPlaying ? (
            <Play className="w-4 h-4 text-accent fill-current ml-0.5" />
          ) : (
            <>
              <span className="text-xs font-mono group-hover:hidden">
                {index !== undefined
                  ? (index + 1).toString().padStart(2, '0')
                  : (track.trackNumber || 1).toString().padStart(2, '0')}
              </span>
              <Play className="w-4 h-4 hidden group-hover:block ml-0.5" />
            </>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <Link
            href={`/track/${track.slug || track.id}`}
            className={`text-xs sm:text-sm font-medium truncate block transition-colors ${
              isCurrent ? 'text-accent font-semibold' : 'text-foreground hover:text-accent'
            }`}
          >
            {track.title}
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-foreground-subtle truncate">
            {track.artistName && <span>{track.artistName}</span>}
            {track.subtitle && (
              <>
                <span>•</span>
                <span className="truncate italic">{track.subtitle}</span>
              </>
            )}
            {track.language && (
              <>
                <span>•</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-background-elevated rounded text-foreground-subtle">
                  {track.language}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Duration & Actions */}
      <div className="flex items-center gap-3 ml-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isFav
              ? 'text-red-400'
              : 'text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100'
          }`}
          title={isFav ? 'Remove Favorite' : 'Add Favorite'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current opacity-100' : ''}`} />
        </button>

        {track.isDownloadable && (
          <a
            href={getSupabaseAudioUrl(track.audioUrl)}
            download={`${track.slug || track.id}.mp3`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block"
            title="Download track"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
        )}

        <span className="text-xs font-mono text-foreground-subtle min-w-[44px] text-right">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
