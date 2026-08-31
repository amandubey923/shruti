'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, Music } from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { formatDuration, resolveTrackCover } from '@/lib/utils';

interface AudioCardProps {
  track: AudioTrack;
}

export function AudioCard({ track }: AudioCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayback();
  const { isFavorite, toggleFavorite } = useLibrary();

  const isCurrent = currentTrack?.id === track.id;
  const isFav = isFavorite(track.id);
  const coverUrl = resolveTrackCover(track);

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="group relative bg-background-card hover:bg-background-elevated border border-background-border/60 hover:border-background-border rounded-2xl p-3.5 transition-all duration-200 flex flex-col justify-between">
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-background-elevated">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={track.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-subtle">
            <Music className="w-8 h-8" />
          </div>
        )}

        {track.category && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-md rounded-md text-[10px] uppercase font-semibold tracking-wider text-foreground-muted border border-background-border/40">
            {track.category}
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-background-border/40 transition-all ${
            isFav
              ? 'text-red-400 opacity-100'
              : 'text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100'
          }`}
          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handlePlay}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-accent text-background flex items-center justify-center shadow-lg transition-all duration-200 transform ${
            isCurrent
              ? 'opacity-100 scale-100 ring-2 ring-accent/40'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-accent-hover active:scale-95'
          }`}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="min-w-0">
        <Link
          href={`/track/${track.slug || track.id}`}
          className="text-xs sm:text-sm font-semibold text-foreground hover:text-accent transition-colors truncate block"
        >
          {track.title}
        </Link>
        <p className="text-[11px] text-foreground-subtle truncate mt-0.5">
          {track.artistName || track.seriesName || 'SHRUTI Master Recording'}
        </p>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-background-border/40 text-[10px] text-foreground-subtle font-mono">
          <span>{formatDuration(track.duration)}</span>
          {track.language && <span>{track.language}</span>}
        </div>
      </div>
    </div>
  );
}
