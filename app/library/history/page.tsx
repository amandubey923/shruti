'use client';

import React from 'react';
import Link from 'next/link';
import { History, ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { getAllTracks } from '@/lib/firestore';
import { formatDuration, formatDate } from '@/lib/utils';

export default function HistoryPage() {
  const { history } = useLibrary();
  const { playTrack } = usePlayback();

  const handlePlayHistoryItem = async (audioId: string, lastPos: number) => {
    const all = await getAllTracks();
    const target = all.find((t) => t.id === audioId);
    if (target) {
      playTrack(target, lastPos);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      <div className="border-b border-background-border/60 pb-6">
        <div className="flex items-center gap-2 text-accent mb-1">
          <History className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider font-semibold">Listening Log</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Listening History
        </h1>
        <p className="text-xs text-foreground-subtle mt-1">
          Review past listened discourses and resume where you stopped.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="py-16 text-center text-foreground-subtle text-xs bg-background-card rounded-2xl border border-background-border space-y-2">
          <p className="text-sm text-foreground">No listening history recorded</p>
          <p className="text-xs text-foreground-subtle">
            Start listening to any discourse, meditation, or raga to track your progress.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const percentage =
              item.duration > 0
                ? Math.min(100, Math.round((item.lastPosition / item.duration) * 100))
                : 0;

            return (
              <div
                key={item.audioId}
                className="p-4 rounded-2xl bg-background-card border border-background-border/70 hover:border-background-border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] text-foreground-subtle mb-1">
                    {item.category && (
                      <span className="px-2 py-0.5 bg-background-elevated rounded text-accent font-semibold uppercase">
                        {item.category}
                      </span>
                    )}
                    <span>•</span>
                    <span>Played on {formatDate(item.lastPlayedAt)}</span>
                  </div>

                  <h3 className="font-serif text-sm sm:text-base font-bold text-foreground truncate">
                    {item.trackTitle || 'Audio Track'}
                  </h3>

                  <p className="text-xs text-foreground-muted truncate">
                    {item.artistName || item.seriesName || 'SHRUTI Master Recording'}
                  </p>

                  <div className="flex items-center gap-3 mt-2.5 max-w-xs">
                    <div className="flex-1 h-1.5 bg-background-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground-subtle">
                      {formatDuration(item.lastPosition)} / {formatDuration(item.duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handlePlayHistoryItem(item.audioId, item.lastPosition)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-background rounded-full text-xs font-semibold shadow transition-all active:scale-95"
                  >
                    {item.completed ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Replay</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
