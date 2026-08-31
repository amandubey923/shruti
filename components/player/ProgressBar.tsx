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

  const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  return (
    <div className={`w-full flex items-center gap-3 select-none ${className}`}>
      {showTimestamps && (
        <span className="text-[11px] font-mono text-foreground-subtle min-w-[40px] text-right">
          {formatDuration(currentTime)}
        </span>
      )}

      <div
        ref={barRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex-1 h-2 py-1.5 flex items-center cursor-pointer group"
      >
        <div className="w-full h-1 bg-background-hover rounded-full overflow-hidden relative">
          {hoverPosition !== null && (
            <div
              className="absolute top-0 bottom-0 left-0 bg-foreground-muted/20 transition-all rounded-full"
              style={{ width: `${hoverPosition}%` }}
            />
          )}

          <div
            className="h-full bg-accent rounded-full transition-all group-hover:bg-accent-hover"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div
          className="absolute w-3 h-3 bg-accent rounded-full -ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none ring-2 ring-accent/30"
          style={{ left: `${percentage}%` }}
        />

        {hoverPosition !== null && hoverTime !== null && (
          <div
            className="absolute -top-7 transform -translate-x-1/2 px-1.5 py-0.5 bg-background-surface border border-background-border rounded text-[10px] font-mono text-foreground shadow-lg pointer-events-none"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {showTimestamps && (
        <span className="text-[11px] font-mono text-foreground-subtle min-w-[40px]">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}
