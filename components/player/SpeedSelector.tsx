'use client';

import React, { useState } from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpeedSelectorProps {
  currentSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export function SpeedSelector({ currentSpeed, onSpeedChange }: SpeedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium text-foreground-muted hover:text-foreground hover:bg-background-hover rounded-lg border border-transparent hover:border-background-border transition-colors"
        aria-label="Select playback speed"
        aria-expanded={isOpen}
      >
        <Gauge className="w-3.5 h-3.5" />
        <span>{currentSpeed}x</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full mb-2 right-0 bg-background-surface border border-background-border rounded-xl shadow-xl p-1 z-50 animate-fade-in min-w-[90px]">
            <p className="text-[10px] uppercase font-semibold text-foreground-subtle px-2 py-1 tracking-wider">
              Speed
            </p>
            {SPEEDS.map((speed) => (
              <button
                key={speed}
                onClick={() => {
                  onSpeedChange(speed);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full text-left px-2.5 py-1 text-xs font-mono rounded-lg transition-colors flex items-center justify-between',
                  currentSpeed === speed
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
                )}
              >
                <span>{speed}x</span>
                {speed === 1 && <span className="text-[10px] text-foreground-subtle">Std</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

