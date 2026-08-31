'use client';

import React, { useRef, useState } from 'react';
import { formatDuration } from '@/lib/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
  showTimestamps?: boolean;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  className = '',
  showTimestamps = true,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const updateSeekFromEvent = (clientX: number) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
    if (isDragging) {
      updateSeekFromEvent(e.clientX);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverPosition(null);
      setHoverTime(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateSeekFromEvent(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className={`w-full flex items-center gap-3.5 select-none ${className}`}>
      {showTimestamps && (
        <span className="text-[11px] sm:text-xs font-mono font-bold text-foreground-muted min-w-[42px] text-right">
          {formatDuration(currentTime)}
        </span>
      )}

      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 h-6 flex items-center cursor-pointer group py-2"
        role="slider"
        aria-label="Seek position slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 5));
          if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 5));
        }}
      >
        {/* Track Background */}
        <div className="w-full h-1.5 bg-background-elevated group-hover:h-2 rounded-full overflow-hidden relative border border-background-border/40 transition-all">
          {hoverPosition !== null && (
            <div
              className="absolute top-0 bottom-0 left-0 bg-accent/20 transition-all rounded-full"
              style={{ width: `${hoverPosition}%` }}
            />
          )}

          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Tactile Scrubber Thumb */}
        <div
          className="absolute w-3.5 h-3.5 bg-accent border-2 border-stone-950 rounded-full -ml-1.75 opacity-90 group-hover:opacity-100 group-hover:scale-125 transition-all shadow-md pointer-events-none ring-2 ring-accent/30"
          style={{ left: `${percentage}%` }}
        />

        {/* Hover Tooltip Timestamp */}
        {hoverPosition !== null && hoverTime !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 px-2 py-0.5 bg-background-surface border border-background-border rounded-md text-[10px] font-mono font-bold text-foreground shadow-xl pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {showTimestamps && (
        <span className="text-[11px] sm:text-xs font-mono font-bold text-foreground-subtle min-w-[42px]">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
