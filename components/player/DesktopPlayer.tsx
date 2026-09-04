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
  Share2,
  Maximize2,
  Moon,
} from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { ProgressBar } from './ProgressBar';
import { VolumeControl } from './VolumeControl';
import { SpeedSelector } from './SpeedSelector';
import { QueueDrawer } from './QueueDrawer';
import { SleepTimerModal } from './SleepTimerModal';
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
    sleepTimer,
    sleepTimerRemaining,
  } = usePlayback();

  const { isFavorite, toggleFavorite } = useLibrary();
  const [showQueue, setShowQueue] = useState(false);
  const [showSleepTimer, setShowSleepTimer] = useState(false);
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

  return (
    <>
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-background-border px-6 py-3.5 shadow-2xl transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Left: Track Details */}
          <div className="flex items-center gap-3.5 w-1/4 min-w-[240px]">
            <div className="relative w-13 h-13 rounded-2xl overflow-hidden flex-shrink-0 bg-background-elevated border border-background-border shadow-sm group">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={currentTrack.title}
                  fill
                  sizes="52px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-accent/20 flex items-center justify-center text-accent font-serif font-bold">
                  S
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/track/${currentTrack.slug || currentTrack.id}`}
                className="text-xs sm:text-sm font-bold text-foreground hover:text-accent transition-colors truncate block"
              >
                {currentTrack.title}
              </Link>
              <p className="text-[11px] font-medium text-foreground-subtle truncate mt-0.5">
                {currentTrack.artistName || currentTrack.seriesName || 'SHRUTI Archive'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(currentTrack.id)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isFav
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-foreground-subtle hover:text-foreground hover:bg-background-elevated'
              }`}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center flex-1 max-w-2xl px-4">
            <div className="flex items-center gap-3 sm:gap-4 mb-2">
              <button
                type="button"
                onClick={toggleShuffle}
                className={`p-2 rounded-full transition-colors ${
                  isShuffled ? 'text-accent bg-accent/15' : 'text-foreground-subtle hover:text-foreground'
                }`}
                title={isShuffled ? 'Shuffle Enabled' : 'Shuffle Disabled'}
                aria-label="Toggle Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={playPrevious}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors active:scale-90"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => skipTime(-15)}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors active:scale-90"
                title="Skip back 15s"
                aria-label="Skip back 15s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Dominant Primary Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-stone-950 flex items-center justify-center transition-all transform active:scale-95 shadow-lg shadow-accent/25"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skipTime(30)}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors active:scale-90"
                title="Skip forward 30s"
                aria-label="Skip forward 30s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={playNext}
                className="p-2 text-foreground-muted hover:text-foreground transition-colors active:scale-90"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleRepeat}
                className={`p-2 rounded-full transition-colors ${
                  repeatMode !== 'off' ? 'text-accent bg-accent/15' : 'text-foreground-subtle hover:text-foreground'
                }`}
                title={`Repeat: ${repeatMode}`}
                aria-label={`Repeat mode: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
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
          <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[240px]">
            <SpeedSelector
              currentSpeed={playbackRate}
              onSpeedChange={setSpeed}
            />

            <button
              type="button"
              onClick={() => setShowSleepTimer(true)}
              className={`p-2 rounded-xl transition-colors relative ${
                sleepTimer
                  ? 'bg-accent/20 text-accent font-bold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
              }`}
              title={
                sleepTimer
                  ? `Sleep Timer: ${sleepTimer === 'end_of_track' ? 'End of Track' : Math.ceil((sleepTimerRemaining || 0) / 60) + 'm'}`
                  : 'Set Sleep Timer'
              }
              aria-label="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
              {sleepTimer && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowQueue(!showQueue)}
              className={`p-2 rounded-xl transition-colors ${
                showQueue ? 'bg-accent/20 text-accent font-bold' : 'text-foreground-muted hover:text-foreground hover:bg-background-elevated'
              }`}
              title="Queue"
              aria-label="Playback Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 text-foreground-muted hover:text-foreground hover:bg-background-elevated rounded-xl transition-colors relative"
              title="Share Track"
              aria-label="Share Track"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-accent text-stone-950 rounded-md text-[10px] font-bold whitespace-nowrap shadow-lg">
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
              type="button"
              onClick={() => setIsExpandedPlayer(true)}
              className="p-2 text-foreground-subtle hover:text-foreground hover:bg-background-elevated rounded-xl transition-colors"
              title="Expand Immersive View"
              aria-label="Expand Immersive View"
            >
              <Maximize2 className="w-4 h-4" />
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

      <SleepTimerModal
        isOpen={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
      />
    </>
  );
}
