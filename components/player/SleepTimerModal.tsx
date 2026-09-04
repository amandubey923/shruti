'use client';

import React from 'react';
import { Moon, X, Check, Clock } from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SleepTimerModal({ isOpen, onClose }: SleepTimerModalProps) {
  const { sleepTimer, sleepTimerRemaining, setSleepTimer } = usePlayback();

  if (!isOpen) return null;

  const options: Array<{ label: string; value: number | 'end_of_track' }> = [
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '60 Minutes', value: 60 },
    { label: 'End of Discourse', value: 'end_of_track' },
  ];

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-sm bg-background-card border border-background-border rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-foreground">Sleep Timer</h3>
              <p className="text-[11px] text-foreground-subtle">
                Fade out audio for peaceful night contemplation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-foreground-subtle hover:text-foreground hover:bg-background-elevated transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {sleepTimer && (
          <div className="px-3.5 py-2.5 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-foreground-muted flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-accent animate-pulse" />
              Active Timer
            </span>
            <span className="font-mono font-bold text-accent">
              {sleepTimer === 'end_of_track'
                ? 'End of Track'
                : sleepTimerRemaining !== null
                ? `${formatCountdown(sleepTimerRemaining)} left`
                : `${sleepTimer} min`}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {options.map((opt) => {
            const isSelected = sleepTimer === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  setSleepTimer(opt.value);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-accent text-stone-950 shadow-sm font-bold'
                    : 'bg-background-elevated/70 hover:bg-background-elevated text-foreground border border-background-border/50'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
              </button>
            );
          })}

          {sleepTimer && (
            <button
              type="button"
              onClick={() => {
                setSleepTimer(null);
                onClose();
              }}
              className="w-full mt-2 py-2.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors text-center"
            >
              Turn Off Timer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
