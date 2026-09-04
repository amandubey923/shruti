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

    const updateRealDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setCurrentTrack((prev) => {
          if (prev && (!prev.duration || Math.abs(prev.duration - audio.duration) > 2)) {
            return { ...prev, duration: Math.round(audio.duration) };
          }
          return prev;
        });
      }
    };

    const handleLoadedMetadata = () => {
      updateRealDuration();
      setIsLoading(false);
      setError(null);
    };

    const handleDurationChange = () => {
      updateRealDuration();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (duration === 0 && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        updateRealDuration();
      }
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
      updateRealDuration();
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
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
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

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('shruti:progress_updated', { detail: progressData })
        );
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
        setDuration(track.duration || 0);

        const src = getSupabaseAudioUrl(track.audioUrl);
        audio.src = src;
        audio.playbackRate = playbackRate;

        // Restore resume position if available
        let resumePos = 0;
        if (initialPosition !== undefined) {
          resumePos = initialPosition;
        } else {
          try {
            const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
            if (raw) {
              const map = JSON.parse(raw);
              if (map[track.id] && !map[track.id].completed) {
                resumePos = map[track.id].lastPosition || 0;
              }
            }
          } catch {
            // ignore storage error
          }
        }

        const handleCanPlay = () => {
          if (resumePos > 0 && resumePos < (audio.duration || track.duration)) {
            audio.currentTime = resumePos;
            setCurrentTime(resumePos);
          } else {
            setCurrentTime(0);
          }

          audio.play().catch(() => {
            setIsPlaying(false);
            setIsLoading(false);
          });
        };

        audio.addEventListener('canplay', handleCanPlay, { once: true });
        audio.load();
      } else {
        audio.play().catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
      }
    },
    [currentTrack?.id, playbackRate]
  );

  const pauseTrack = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resumeTrack = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrack]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, currentTrack, pauseTrack, resumeTrack]);

  const seek = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(seconds, audioRef.current.duration || Infinity));
    setCurrentTime(audioRef.current.currentTime);
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    const newTime = audioRef.current.currentTime + seconds;
    seek(newTime);
  }, [seek]);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    if (clamped > 0) setIsMuted(false);
    localStorage.setItem('shruti_volume', clamped.toString());
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
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
    setRepeatMode((prev) => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    if (queueIndex < queue.length - 1) {
      const nextIdx = queueIndex + 1;
      setQueueIndex(nextIdx);
      playTrack(queue[nextIdx], 0);
    } else if (repeatMode === 'all') {
      setQueueIndex(0);
      playTrack(queue[0], 0);
    }
  }, [queue, queueIndex, repeatMode, playTrack]);

  const playPrevious = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }
    if (queue.length > 0 && queueIndex > 0) {
      const prevIdx = queueIndex - 1;
      setQueueIndex(prevIdx);
      playTrack(queue[prevIdx], 0);
    }
  }, [queue, queueIndex, seek, playTrack]);

  // Handle Track Completion
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentTrack) {
        saveProgress(currentTrack, audio.duration || currentTrack.duration, audio.duration || currentTrack.duration);
      }

      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [currentTrack, repeatMode, playNext, saveProgress]);

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
    setQueueIndex((prev) => (index < prev ? prev - 1 : prev));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(-1);
  }, []);

  const playSeriesAll = useCallback(
    (tracks: AudioTrack[], startIndex = 0) => {
      if (!tracks.length) return;
      setQueue(tracks);
      setQueueIndex(startIndex);
      playTrack(tracks[startIndex], 0);
    },
    [playTrack]
  );

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
