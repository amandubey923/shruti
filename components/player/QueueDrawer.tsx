'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, Music } from 'lucide-react';
import { AudioTrack } from '@/types/audio';
import { formatDuration } from '@/lib/utils';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: AudioTrack[];
  queueIndex: number;
  onSelectTrack: (track: AudioTrack) => void;
  onRemoveTrack: (index: number) => void;
  onClearQueue: () => void;
}

export function QueueDrawer({
  isOpen,
  onClose,
  queue,
  queueIndex,
  onSelectTrack,
  onRemoveTrack,
  onClearQueue,
}: QueueDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      <div className="fixed bottom-24 right-4 w-96 max-w-[calc(100vw-2rem)] max-h-[520px] bg-background-surface border border-background-border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-background-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-accent" />
            <h4 className="text-sm font-semibold text-foreground">Listening Queue</h4>
            <span className="text-[11px] text-foreground-subtle">({queue.length})</span>
          </div>

          <div className="flex items-center gap-1">
            {queue.length > 0 && (
              <button
                onClick={onClearQueue}
                className="p-1.5 text-xs text-foreground-subtle hover:text-red-400 transition-colors"
                title="Clear Queue"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-foreground-muted hover:text-foreground transition-colors rounded-lg hover:bg-background-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Tracks */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-background-border/20">
          {queue.length === 0 ? (
            <div className="py-12 text-center text-foreground-subtle text-xs">
              Queue is empty
            </div>
          ) : (
            queue.map((track, idx) => {
              const isCurrent = idx === queueIndex;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-xl transition-colors group ${
                    isCurrent
                      ? 'bg-accent/10 border border-accent/20'
                      : 'hover:bg-background-hover'
                  }`}
                >
                  <button
                    onClick={() => onSelectTrack(track)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-background-elevated">
                      {track.coverImage ? (
                        <Image
                          src={track.coverImage}
                          alt={track.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-foreground-subtle">
                          <Music className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-medium truncate ${
                          isCurrent ? 'text-accent font-semibold' : 'text-foreground'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-[10px] text-foreground-subtle truncate">
                        {track.artistName || track.seriesName || 'SHRUTI'}
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] font-mono text-foreground-subtle">
                      {formatDuration(track.duration)}
                    </span>
                    <button
                      onClick={() => onRemoveTrack(idx)}
                      className="p-1 text-foreground-subtle hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from queue"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

