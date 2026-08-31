'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, Heart, Music } from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';

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
  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="lg:hidden fixed bottom-16 left-3 right-3 z-40 bg-background-surface/95 backdrop-blur-md border border-background-border rounded-2xl shadow-2xl overflow-hidden transition-all">
      {/* Micro progress line */}
      <div className="h-0.5 w-full bg-background-hover relative">
        <div
          className="h-full bg-accent transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="p-2.5 flex items-center justify-between gap-3">
        {/* Artwork & Info (Tap to expand) */}
        <button
          onClick={() => setIsExpandedPlayer(true)}
          className="flex items-center gap-3 min-w-0 flex-1 text-left"
          aria-label="Expand player"
        >
          <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-background-elevated">
            {currentTrack.coverImage ? (
              <Image
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-accent">
                <Music className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate">
              {currentTrack.title}
            </p>
            <p className="text-[10px] text-foreground-subtle truncate">
              {currentTrack.artistName || currentTrack.seriesName || 'SHRUTI'}
            </p>
          </div>
        </button>

        {/* Quick Actions: Favorite & Play/Pause */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(currentTrack.id);
            }}
            className={`p-2 rounded-full transition-colors ${
              isFav ? 'text-red-400' : 'text-foreground-subtle'
            }`}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            disabled={isLoading}
            className="w-9 h-9 rounded-full bg-accent text-background flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-accent/20"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

