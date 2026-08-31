'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { AudioTrack, RepeatMode } from '@/types/audio';
import { PlaybackProgress } from '@/types/user';
import { useAuth } from './AuthContext';
import { saveUserProgress } from '@/lib/firestore';
import { resolveTrackCover } from '@/lib/utils';
import { getSupabaseAudioUrl } from '@/lib/supabase';

interface PlaybackContextType {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  isLoading: boolean;
  error: string | null;
  queue: AudioTrack[];
  queueIndex: number;
  isExpandedPlayer: boolean;
  setIsExpandedPlayer: (expanded: boolean) => void;
  playTrack: (track: AudioTrack, initialPosition?: number) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  skipTime: (seconds: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setSpeed: (rate: number) => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: AudioTrack) => void;
  playNextInQueue: (track: AudioTrack) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playSeriesAll: (tracks: AudioTrack[], startIndex?: number) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

const LOCAL_PROGRESS_KEY = 'shruti_playback_progress';
const LOCAL_LAST_TRACK_KEY = 'shruti_last_track';

export function PlaybackProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queue, setQueue] = useState<AudioTrack[]>([]);
  const [queueIndex, setQueueIndex] = useState<number>(-1);
  const [isExpandedPlayer, setIsExpandedPlayer] = useState<boolean>(false);

  const lastSaveTimeRef = useRef<number>(0);

  // Initialize HTML5 Audio Element singleton
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = volume;
    audioRef.current = audio;

    const savedVol = localStorage.getItem('shruti_volume');
    if (savedVol) {
      const v = parseFloat(savedVol);
      audio.volume = v;
      setVolumeState(v);
    }
    const savedSpeed = localStorage.getItem('shruti_speed');
    if (savedSpeed) {
      const s = parseFloat(savedSpeed);
      audio.playbackRate = s;
      setPlaybackRate(s);
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack?.duration || 0);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 10000 && currentTrack) {
        lastSaveTimeRef.current = now;
        saveProgress(currentTrack, audio.currentTime, audio.duration || currentTrack.duration);
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };
    const handlePause = () => {
      setIsPlaying(false);
      if (currentTrack) {
        saveProgress(currentTrack, audio.currentTime, audio.duration || currentTrack.duration);
      }
    };

    const handleError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      setError('Unable to load audio file. Please check connection or source URL.');
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  const saveProgress = useCallback(
    (track: AudioTrack, pos: number, dur: number) => {
      if (!track || isNaN(pos)) return;
      const progressData: PlaybackProgress = {
        audioId: track.id,
        lastPosition: Math.floor(pos),
        duration: Math.floor(dur || track.duration || 0),
        lastPlayedAt: new Date().toISOString(),
        completed: dur > 0 ? pos >= dur - 20 : false,
        trackTitle: track.title,
        artistName: track.artistName,
        seriesName: track.seriesName,
        seriesId: track.seriesId,
        coverImage: resolveTrackCover(track),
        category: typeof track.category === 'string' ? track.category : undefined,
      };

      try {
        const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
        const map: Record<string, PlaybackProgress> = raw ? JSON.parse(raw) : {};
        map[track.id] = progressData;
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(map));
        localStorage.setItem(LOCAL_LAST_TRACK_KEY, JSON.stringify(track));
      } catch (e) {
        console.warn('localStorage save failed', e);
      }

      if (user?.uid) {
        saveUserProgress(user.uid, progressData);
      }
    },
    [user?.uid]
  );

  const playTrack = useCallback(
    (track: AudioTrack, initialPosition?: number) => {
      const audio = audioRef.current;
      if (!audio) return;

      setError(null);
      setIsLoading(true);

      const isSameTrack = currentTrack?.id === track.id;

      if (!isSameTrack) {
        setCurrentTrack(track);
        audio.src = getSupabaseAudioUrl(track.audioUrl);
        audio.load();

        const idx = queue.findIndex((item) => item.id === track.id);
        if (idx !== -1) {
          setQueueIndex(idx);
        } else {
          setQueue([track]);
          setQueueIndex(0);
        }
      }

      let seekPos = initialPosition;
      if (seekPos === undefined && !isSameTrack) {
        try {
          const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
          if (raw) {
            const map = JSON.parse(raw);
            if (map[track.id] && !map[track.id].completed) {
              seekPos = map[track.id].lastPosition;
            }
          }
        } catch {
          seekPos = 0;
        }
      }

      const onCanPlay = () => {
        if (seekPos && seekPos > 0 && seekPos < audio.duration) {
          audio.currentTime = seekPos;
        }
        audio
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Audio play request failed:', err);
            setIsPlaying(false);
          });
        audio.removeEventListener('canplay', onCanPlay);
      };

      audio.addEventListener('canplay', onCanPlay);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artistName || 'SHRUTI',
          album: track.seriesName || track.albumName || 'SHRUTI Archive',
          artwork: [
            {
              src: resolveTrackCover(track),
              sizes: '512x512',
              type: 'image/webp',
            },
          ],
        });
      }
    },
    [currentTrack, queue]
  );

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn('Audio resume error:', e));
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      if (currentTrack) {
        resumeTrack();
      }
    }
  }, [isPlaying, currentTrack, pauseTrack, resumeTrack]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || 0));
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current) {
      seek(audioRef.current.currentTime + seconds);
    }
  }, [seek]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        pauseTrack();
        return;
      }
    }
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      playTrack(nextTrack, 0);
    }
  }, [queue, queueIndex, repeatMode, pauseTrack, playTrack]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 5) {
      seek(0);
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      playTrack(prevTrack, 0);
    }
  }, [queue, queueIndex, seek, playTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentTrack) {
        saveProgress(currentTrack, audio.duration, audio.duration);
      }
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.warn);
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrack, repeatMode, playNext, saveProgress]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    localStorage.setItem('shruti_volume', clamped.toString());
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const setSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    localStorage.setItem('shruti_speed', rate.toString());
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const addToQueue = useCallback((track: AudioTrack) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const playNextInQueue = useCallback((track: AudioTrack) => {
    setQueue((prev) => {
      const copy = [...prev];
      copy.splice(queueIndex + 1, 0, track);
      return copy;
    });
  }, [queueIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(-1);
    }
  }, [currentTrack]);

  const playSeriesAll = useCallback(
    (tracks: AudioTrack[], startIndex: number = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setQueueIndex(startIndex);
      playTrack(tracks[startIndex], 0);
    },
    [playTrack]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-15);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(30);
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        case 'KeyN':
          e.preventDefault();
          playNext();
          break;
        case 'KeyP':
          e.preventDefault();
          playPrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipTime, toggleMute, playNext, playPrevious]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => resumeTrack());
      navigator.mediaSession.setActionHandler('pause', () => pauseTrack());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      navigator.mediaSession.setActionHandler('seekbackward', () => skipTime(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => skipTime(30));
    }
  }, [resumeTrack, pauseTrack, playPrevious, playNext, skipTime]);

  return (
    <PlaybackContext.Provider
      value={{
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
        error,
        queue,
        queueIndex,
        isExpandedPlayer,
        setIsExpandedPlayer,
        playTrack,
        pauseTrack,
        resumeTrack,
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
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        clearQueue,
        playSeriesAll,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
}
