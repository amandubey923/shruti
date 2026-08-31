'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ChevronDown,
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
  Download,
} from 'lucide-react';
import { usePlayback } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { ProgressBar } from './ProgressBar';
import { SpeedSelector } from './SpeedSelector';
import { QueueDrawer } from './QueueDrawer';
import { resolveTrackCover } from '@/lib/utils';

export function MobileFullPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    repeatMode,
    isShuffled,
    isLoading,
    queue,
    queueIndex,
    isExpandedPlayer,
    setIsExpandedPlayer,
    togglePlay,
    seek,
    skipTime,
    playNext,
    playPrevious,
    setSpeed,
    toggleRepeat,
    toggleShuffle,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = usePlayback();

  const { isFavorite, toggleFavorite } = useLibrary();
  const [showQueue, setShowQueue] = useState(false);

  if (!currentTrack || !isExpandedPlayer) return null;

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
    }
  };

  const handleDownload = () => {
    if (!currentTrack.isDownloadable) return;
    const link = document.createElement('a');
    link.href = currentTrack.audioUrl;
    link.download = `${currentTrack.slug || currentTrack.id}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col justify-between p-6 sm:p-8 animate-slide-up overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpandedPlayer(false)}
          className="p-2 text-foreground-muted hover:text-foreground rounded-full hover:bg-background-elevated transition-colors -ml-2"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-accent">
            Now Listening
          </span>
          {currentTrack.seriesName && (
            <p className="text-xs text-foreground-muted truncate max-w-[200px]">
              {currentTrack.seriesName}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowQueue(!showQueue)}
          className="p-2 text-foreground-muted hover:text-foreground rounded-full hover:bg-background-elevated transition-colors -mr-2"
          aria-label="View Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>
      </div>

      {/* Main Center Area: Artwork & Typography */}
      <div className="my-auto py-6 flex flex-col items-center max-w-sm mx-auto w-full">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-background-border/60 mb-8 bg-background-elevated">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={currentTrack.title}
              fill
              sizes="300px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-accent text-3xl font-serif">
              SHRUTI
            </div>
          )}
        </div>

        {/* Track Title & Speaker */}
        <div className="w-full flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-sm text-foreground-muted mt-1 truncate">
              {currentTrack.artistName || 'SHRUTI Master Recording'}
            </p>
            {currentTrack.subtitle && (
              <p className="text-xs text-foreground-subtle italic mt-0.5 truncate">
                {currentTrack.subtitle}
              </p>
            )}
          </div>

          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`p-2.5 rounded-full border border-background-border transition-colors ${
              isFav ? 'text-red-400 bg-red-500/10' : 'text-foreground-subtle hover:text-foreground'
            }`}
            aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart className={`w-5 h-5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Scrubber */}
        <div className="w-full mb-6">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
            className="w-full"
          />
        </div>

        {/* Primary Playback Transport Controls */}
        <div className="w-full flex items-center justify-between mb-8 px-2">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              isShuffled ? 'text-accent' : 'text-foreground-subtle'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            onClick={playPrevious}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => skipTime(-15)}
            className="p-2 text-foreground-subtle hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-16 h-16 rounded-full bg-accent hover:bg-accent-hover text-background flex items-center justify-center transition-all transform active:scale-95 shadow-xl shadow-accent/20"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={() => skipTime(30)}
            className="p-2 text-foreground-subtle hover:text-foreground transition-colors"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            onClick={playNext}
            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              repeatMode !== 'off' ? 'text-accent' : 'text-foreground-subtle'
            }`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Secondary Actions: Speed, Share, Download */}
        <div className="w-full flex items-center justify-around border-t border-background-border/40 pt-4">
          <SpeedSelector
            currentSpeed={playbackRate}
            onSpeedChange={setSpeed}
          />

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-foreground-subtle hover:text-foreground transition-colors p-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {currentTrack.isDownloadable && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs text-foreground-subtle hover:text-foreground transition-colors p-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
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
    </div>
  );
}
