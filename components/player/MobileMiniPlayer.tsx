'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, Heart, Music } from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { resolveTrackCover } from '@/lib/utils';

export function MobileMiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    isLoading,
    setIsExpandedPlayer,
  } = usePlayback();

  const { isFavorite, toggleFavorite } = useLibrary();

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const percentage = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const coverUrl = resolveTrackCover(currentTrack);

  return (
    <div className="lg:hidden fixed bottom-[68px] left-3 right-3 z-40 bg-background/95 backdrop-blur-xl border border-background-border rounded-2xl shadow-2xl overflow-hidden transition-all">
      {/* Real-time Accent Scrubber Line */}
      <div className="h-1 w-full bg-background-elevated relative">
        <div
          className="h-full bg-accent transition-all duration-150"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="p-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpandedPlayer(true)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left active:opacity-80 transition-opacity"
          aria-label="Open full audio player"
        >
          <div className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border/80 shadow-xs">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={currentTrack.title}
                fill
                sizes="44px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent">
                <Music className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-foreground truncate">
              {currentTrack.title}
            </p>
            <p className="text-[11px] font-medium text-foreground-subtle truncate mt-0.5">
              {currentTrack.artistName || currentTrack.seriesName || 'SHRUTI Archive'}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isFav ? 'text-red-500 bg-red-500/10' : 'text-foreground-subtle hover:text-foreground'
            }`}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            disabled={isLoading}
            className="w-11 h-11 rounded-full bg-accent text-stone-950 flex items-center justify-center transition-transform active:scale-90 shadow-md shadow-accent/25"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
