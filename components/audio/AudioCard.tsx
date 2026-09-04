'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, Heart, Music, Clock } from 'lucide-react';
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
    <div className="group relative bg-background-card hover:bg-background-elevated border border-background-border hover:border-accent/40 rounded-3xl p-4 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md h-full">
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden mb-3.5 bg-background-elevated border border-background-border/50">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={track.title}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground-subtle">
            <Music className="w-10 h-10 text-accent" />
          </div>
        )}

        {track.category && (
          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-background/90 backdrop-blur-md rounded-md text-[10px] uppercase font-bold tracking-wider text-accent border border-background-border/60">
            {track.category}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(track.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-background/90 backdrop-blur-md border border-background-border/60 transition-all flex items-center justify-center ${
            isFav
              ? 'text-red-500 opacity-100'
              : 'text-foreground-subtle hover:text-foreground opacity-0 group-hover:opacity-100 sm:flex hidden'
          }`}
          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Tactile Play Trigger Button */}
        <button
          type="button"
          onClick={handlePlay}
          className={`absolute bottom-3 right-3 w-11 h-11 rounded-full bg-accent text-stone-950 flex items-center justify-center shadow-lg transition-all duration-200 transform active:scale-90 ${
            isCurrent
              ? 'opacity-100 scale-100 ring-2 ring-accent/40'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-accent-hover'
          }`}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      <div className="min-w-0 space-y-1">
        <Link
          href={`/track/${track.slug || track.id}`}
          className="text-xs sm:text-sm font-bold text-foreground hover:text-accent transition-colors truncate block"
        >
          {track.title}
        </Link>
        <p className="text-[11px] font-medium text-foreground-subtle truncate">
          {track.artistName || track.seriesName || 'SHRUTI Master Recording'}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-background-border/50 text-[11px] text-foreground-subtle font-mono">
          <div className="flex items-center gap-1 font-semibold text-foreground-muted">
            <Clock className="w-3 h-3 text-accent" />
            <span>{formatDuration(track.duration)}</span>
          </div>
          {track.language && (
            <span className="text-[10px] uppercase font-bold text-foreground-subtle px-1.5 py-0.2 rounded bg-background-elevated border border-background-border/50">
              {track.language}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
