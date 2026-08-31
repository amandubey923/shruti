'use client';

import React from 'react';
import { DesktopPlayer } from './DesktopPlayer';
import { MobileMiniPlayer } from './MobileMiniPlayer';
import { MobileFullPlayer } from './MobileFullPlayer';
import { usePlayback } from '@/context/PlaybackContext';

export function AudioPlayer() {
  const { currentTrack, error } = usePlayback();

  if (!currentTrack) return null;

  return (
    <>
      {error && (
        <div className="fixed bottom-24 lg:bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-950/90 border border-red-500/40 text-red-200 px-4 py-2 rounded-full text-xs shadow-xl animate-fade-in flex items-center gap-2">
          <span>{error}</span>
        </div>
      )}
      <DesktopPlayer />
      <MobileMiniPlayer />
      <MobileFullPlayer />
    </>
  );
}
