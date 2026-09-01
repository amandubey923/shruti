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
import { usePlayback, usePlaybackTime } from '@/context/PlaybackContext';
import { useLibrary } from '@/context/LibraryContext';
import { ProgressBar } from './ProgressBar';
import { SpeedSelector } from './SpeedSelector';
import { QueueDrawer } from './QueueDrawer';
import { resolveTrackCover } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';

export function MobileFullPlayer() {
  const {
    currentTrack,
    isPlaying,
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
  const { currentTime, duration } = usePlaybackTime();

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
    } else {
      navigator.clipboard.writeText(shareUrl);
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
    <div className="fixed inset-0 z-50 bg-background flex flex-col justify-between p-6 sm:p-8 animate-slide-up overflow-y-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpandedPlayer(false)}
          className="w-11 h-11 text-foreground-muted hover:text-foreground rounded-full hover:bg-background-elevated transition-colors flex items-center justify-center -ml-2"
          aria-label="Collapse player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        <div className="text-center">
          <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-accent">
            Now Listening
          </span>
          {currentTrack.seriesName && (
            <p className="text-xs font-semibold text-foreground-muted truncate max-w-[200px]">
              {currentTrack.seriesName}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowQueue(!showQueue)}
          className="w-11 h-11 text-foreground-muted hover:text-foreground rounded-full hover:bg-background-elevated transition-colors flex items-center justify-center -mr-2"
          aria-label="View Queue"
        >
          <ListMusic className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* Main Center Area: Artwork & Typography */}
      <div className="my-auto py-4 flex flex-col items-center max-w-sm mx-auto w-full">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-background-border mb-6 bg-background-elevated">
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
            <div className="w-full h-full flex items-center justify-center text-accent text-3xl font-serif font-bold">
              SHRUTI
            </div>
          )}
        </div>

        {/* Track Title & Speaker */}
        <div className="w-full flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-foreground leading-tight truncate">
              {currentTrack.title}
            </h2>
            <p className="text-sm font-semibold text-foreground-muted mt-1 truncate">
              {currentTrack.artistName || 'SHRUTI Master Recording'}
            </p>
            {currentTrack.subtitle && (
              <p className="text-xs text-foreground-subtle italic mt-0.5 truncate">
                {currentTrack.subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentTrack.id)}
            className={`w-11 h-11 rounded-full border border-background-border transition-all flex items-center justify-center flex-shrink-0 ${
              isFav ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-foreground-subtle hover:text-foreground'
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
        <div className="w-full flex items-center justify-between mb-6 px-1">
          <button
            type="button"
            onClick={toggleShuffle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isShuffled ? 'text-accent bg-accent/15' : 'text-foreground-subtle'
            }`}
            aria-label="Toggle Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={playPrevious}
            className="w-11 h-11 text-foreground-muted hover:text-foreground transition-colors flex items-center justify-center active:scale-90"
            aria-label="Previous Track"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => skipTime(-15)}
            className="w-11 h-11 text-foreground-subtle hover:text-foreground transition-colors flex items-center justify-center active:scale-90"
            aria-label="Skip back 15 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Large Dominant Play/Pause CTA */}
          <button
            type="button"
            onClick={togglePlay}
            disabled={isLoading}
            className="w-18 h-18 rounded-full bg-accent hover:bg-accent-hover text-stone-950 flex items-center justify-center transition-all transform active:scale-95 shadow-2xl shadow-accent/30"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <div className="w-7 h-7 border-3 border-stone-950 border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skipTime(30)}
            className="w-11 h-11 text-foreground-subtle hover:text-foreground transition-colors flex items-center justify-center active:scale-90"
            aria-label="Skip forward 30 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={playNext}
            className="w-11 h-11 text-foreground-muted hover:text-foreground transition-colors flex items-center justify-center active:scale-90"
            aria-label="Next Track"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleRepeat}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              repeatMode !== 'off' ? 'text-accent bg-accent/15' : 'text-foreground-subtle'
            }`}
            aria-label={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Secondary Actions: Speed, Share, Download */}
        <div className="w-full flex items-center justify-around border-t border-background-border/60 pt-4">
          <SpeedSelector
            currentSpeed={playbackRate}
            onSpeedChange={setSpeed}
          />

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground-subtle hover:text-foreground transition-colors p-2.5 rounded-xl active:bg-background-elevated"
            aria-label="Share track link"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {currentTrack.isDownloadable && (
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground-subtle hover:text-foreground transition-colors p-2.5 rounded-xl active:bg-background-elevated"
              aria-label="Download MP3 file"
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
