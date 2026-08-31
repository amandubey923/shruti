'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { History, Play, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';
import { usePlayback } from '@/context/PlaybackContext';
import { getAllTracks } from '@/lib/firestore';
import { AudioTrack } from '@/types/audio';
import { formatDuration } from '@/lib/utils';

export default function HistoryPage() {
  const { history } = useLibrary();
  const { playTrack } = usePlayback();
  const [allTracks, setAllTracks] = useState<AudioTrack[]>([]);

  useEffect(() => {
    async function loadTracks() {
      const t = await getAllTracks();
      setAllTracks(t);
    }
    loadTracks();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      <Link
        href="/library"
        className="inline-flex items-center gap-2 text-xs font-medium text-foreground-subtle hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </Link>

      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase mb-2">
          <History className="w-3.5 h-3.5" />
          <span>Playback Activity</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
          Listening History & Progress
        </h1>
        <p className="text-xs sm:text-sm text-foreground-muted mt-1">
          Pick up exactly where you left off across any device.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-background-card rounded-2xl border border-background-border">
          <History className="w-8 h-8 text-foreground-subtle mx-auto" />
          <h3 className="font-serif text-lg font-medium text-foreground">No History Yet</h3>
          <p className="text-xs text-foreground-subtle max-w-sm mx-auto">
            Tracks you listen to will automatically record your progress here.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-background font-semibold rounded-full text-xs mt-2"
          >
            <span>Start Listening</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const target = allTracks.find((t) => t.id === item.audioId);
            const progressPct =
              item.duration > 0 ? Math.min(100, (item.lastPosition / item.duration) * 100) : 0;

            return (
              <div
                key={item.audioId}
                className="p-4 rounded-2xl bg-background-card hover:bg-background-elevated border border-background-border/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.completed && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-400 font-semibold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    )}
                    {item.category && (
                      <span className="text-[10px] px-2 py-0.2 bg-background-elevated rounded text-foreground-subtle uppercase">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/track/${target?.slug || item.audioId}`}
                    className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate block"
                  >
                    {item.trackTitle || target?.title || 'Recording'}
                  </Link>

                  <p className="text-xs text-foreground-subtle truncate">
                    {item.artistName || target?.artistName || 'SHRUTI'}
                    {item.seriesName ? ` • ${item.seriesName}` : ''}
                  </p>

                  {/* Progress line */}
                  <div className="mt-3 max-w-md">
                    <div className="w-full h-1.5 bg-background-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-foreground-subtle font-mono mt-1">
                      <span>{formatDuration(item.lastPosition)}</span>
                      <span>{formatDuration(item.duration)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <button
                    onClick={() => target && playTrack(target, item.lastPosition)}
                    disabled={!target}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-background font-semibold text-xs rounded-full shadow transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{item.completed ? 'Replay' : 'Resume'}</span>
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

