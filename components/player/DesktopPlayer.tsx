'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Download,
  Share2,
  Maximize2,
} from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { SpeedSelector } from './SpeedSelector';
import { QueueDrawer } from './QueueDrawer';
import { resolveTrackCover } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';

export function DesktopPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    repeatMode,
    isShuffled,
    isLoading,
    queue,
    queueIndex,
    togglePlay,
    seek,
    skipTime,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    setSpeed,
    toggleRepeat,
    toggleShuffle,
    playTrack,
    removeFromQueue,
    clearQueue,
    setIsExpandedPlayer,
  } = usePlayback();

  const { isFavorite, toggleFavorite } = useLibrary();
  const [showQueue, setShowQueue] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!currentTrack) return null;

  const isFav = isFavorite(currentTrack.id);
  const coverUrl = resolveTrackCover(currentTrack);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/track/${currentTrack.slug || currentTrack.id}`;
    if (navigator.share) {
      navigator.share({
        title: currentTrack.title,
        text: `Listen to ${currentTrack.title} on SHRUTI`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!currentTrack.isDownloadable) return;
    const link = document.createElement('a');
    link.href = getSupabaseAudioUrl(currentTrack.audioUrl);
    link.download = `${currentTrack.slug || currentTrack.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-background-surface/95 backdrop-blur-md border-t border-background-border/70 px-6 py-3 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border/60 group">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={currentTrack.title}
                  fill
                  sizes="48px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-serif">
                  S
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/track/${currentTrack.slug || currentTrack.id}`}
                className="text-xs font-semibold text-foreground hover:text-accent transition-colors truncate block"
              >
                {currentTrack.title}
              </Link>
              <p className="text-[11px] text-foreground-subtle truncate">
                {currentTrack.artistName || currentTrack.seriesName || 'SHRUTI Archive'}
              </p>
            </div>

            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`p-1.5 rounded-full transition-colors ${
                isFav
                  ? 'text-red-400 hover:text-red-300'
                  : 'text-foreground-subtle hover:text-foreground hover:bg-background-hover'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center flex-1 max-w-2xl px-4">
            <div className="flex items-center gap-4 mb-1.5">
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-full transition-colors ${
                  isShuffled ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'
                }`}
                title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled'}
              >
                <Shuffle className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={playPrevious}
                className="p-1.5 text-foreground-muted hover:text-foreground transition-colors"
                title="Previous Track (P)"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => skipTime(-15)}
                className="p-1.5 text-foreground-subtle hover:text-foreground transition-colors"
                title="Skip back 15s (←)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                disabled={isLoading}
                className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-background flex items-center justify-center transition-all transform active:scale-95 shadow-md shadow-accent/20"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skipTime(30)}
                className="p-1.5 text-foreground-subtle hover:text-foreground transition-colors"
                title="Skip forward 30s (→)"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                onClick={playNext}
                className="p-1.5 text-foreground-muted hover:text-foreground transition-colors"
                title="Next Track (N)"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-full transition-colors ${
                  repeatMode !== 'off' ? 'text-accent' : 'text-foreground-subtle hover:text-foreground'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-3.5 h-3.5" />}
              </button>
            </div>

            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={seek}
              className="w-full"
            />
          </div>

          {/* Right: Actions, Speed, Queue & Volume */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
            <SpeedSelector
              currentSpeed={playbackRate}
              onSpeedChange={setSpeed}
            />

            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`p-1.5 rounded-lg transition-colors ${
                showQueue ? 'bg-accent/15 text-accent' : 'text-foreground-muted hover:text-foreground hover:bg-background-hover'
              }`}
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            {currentTrack.isDownloadable && (
              <button
                onClick={handleDownload}
                className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-hover rounded-lg transition-colors"
                title="Download Track"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-background-hover rounded-lg transition-colors relative"
              title="Share Track"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-background rounded text-[10px] font-semibold whitespace-nowrap shadow">
                  Copied!
                </span>
              )}
            </button>

            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onToggleMute={toggleMute}
            />

            <button
              onClick={() => setIsExpandedPlayer(true)}
              className="p-1.5 text-foreground-subtle hover:text-foreground hover:bg-background-hover rounded-lg transition-colors"
              title="Expand Immersive View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <QueueDrawer
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
        queue={queue}
        queueIndex={queueIndex}
        onSelectTrack={(t) => playTrack(t, 0)}
        onRemoveTrack={removeFromQueue}
        onClearQueue={clearQueue}
      />
    </>
  );
}
