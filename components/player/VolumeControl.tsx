'use client';

import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const currentLevel = isMuted ? 0 : volume;

  const getIcon = () => {
    if (isMuted || currentLevel === 0) return VolumeX;
    if (currentLevel < 0.5) return Volume1;
    return Volume2;
  };

  const Icon = getIcon();

  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={onToggleMute}
        className="p-1.5 text-foreground-muted hover:text-foreground transition-colors rounded-full hover:bg-background-hover"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icon className="w-4 h-4" />
      </button>

      <div className="w-20 flex items-center h-4 cursor-pointer">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentLevel}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-background-hover rounded-lg appearance-none cursor-pointer accent-accent hover:accent-accent-hover transition-all"
          aria-label="Volume slider"
        />
      </div>
    </div>
  );
}

