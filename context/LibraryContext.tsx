'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { Playlist } from '@/types/playlist';
import { PlaybackProgress } from '@/types/user';
import {
  getUserFavorites,
  toggleUserFavorite,
  getUserSavedSeries,
  toggleSavedSeries,
  getUserPlaylists,
  createUserPlaylist,
  deleteUserPlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  getUserHistory,
} from '@/lib/firestore';

interface LibraryContextType {
  favorites: string[];
  savedSeries: string[];
  history: PlaybackProgress[];
  playlists: Playlist[];
  toggleFavorite: (audioId: string) => Promise<void>;
  isFavorite: (audioId: string) => boolean;
  toggleSaveSeries: (seriesId: string) => Promise<void>;
  isSeriesSaved: (seriesId: string) => boolean;
  createPlaylist: (name: string, description?: string) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, audioId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, audioId: string) => Promise<void>;
  refreshLibrary: () => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const LOCAL_FAVORITES_KEY = 'shruti_guest_favorites';
const LOCAL_SAVED_SERIES_KEY = 'shruti_guest_saved_series';
const LOCAL_PLAYLISTS_KEY = 'shruti_guest_playlists';
const LOCAL_PROGRESS_KEY = 'shruti_playback_progress';

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [savedSeries, setSavedSeries] = useState<string[]>([]);
  const [history, setHistory] = useState<PlaybackProgress[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const refreshLibrary = useCallback(async () => {
    if (user?.uid) {
      try {
        const [cloudFavs, cloudSeries, cloudPlaylists, cloudHistory] = await Promise.all([
          getUserFavorites(user.uid),
          getUserSavedSeries(user.uid),
          getUserPlaylists(user.uid),
          getUserHistory(user.uid),
        ]);

        try {
          const localFavsRaw = localStorage.getItem(LOCAL_FAVORITES_KEY);
          if (localFavsRaw) {
            const localFavs: string[] = JSON.parse(localFavsRaw);
            const newFavsToSync = localFavs.filter((id) => !cloudFavs.includes(id));
            for (const fId of newFavsToSync) {
              await toggleUserFavorite(user.uid, fId, true);
              cloudFavs.push(fId);
            }
            localStorage.removeItem(LOCAL_FAVORITES_KEY);
          }
        } catch (e) {
          console.warn('Guest favorite merge error', e);
        }

        setFavorites(Array.from(new Set(cloudFavs)));
        setSavedSeries(cloudSeries);
        setPlaylists(cloudPlaylists);
        setHistory(cloudHistory);
      } catch (err) {
        console.warn('Error refreshing library from Firestore:', err);
      }
    } else {
      try {
        const localFavs = localStorage.getItem(LOCAL_FAVORITES_KEY);
        setFavorites(localFavs ? JSON.parse(localFavs) : []);

        const localSeries = localStorage.getItem(LOCAL_SAVED_SERIES_KEY);
        setSavedSeries(localSeries ? JSON.parse(localSeries) : []);

        const localPlaylists = localStorage.getItem(LOCAL_PLAYLISTS_KEY);
        setPlaylists(localPlaylists ? JSON.parse(localPlaylists) : []);

        const localHistory = localStorage.getItem(LOCAL_PROGRESS_KEY);
        if (localHistory) {
          const histMap: Record<string, PlaybackProgress> = JSON.parse(localHistory);
          const list = Object.values(histMap).sort(
            (a, b) => new Date(b.lastPlayedAt).getTime() - new Date(a.lastPlayedAt).getTime()
          );
          setHistory(list);
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.warn('Error reading guest library from localStorage:', err);
      }
    }
  }, [user?.uid]);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const toggleFavorite = async (audioId: string) => {
    const isCurrentlyFav = favorites.includes(audioId);
    const updatedFavs = isCurrentlyFav
      ? favorites.filter((id) => id !== audioId)
      : [...favorites, audioId];

    setFavorites(updatedFavs);

    if (user?.uid) {
      await toggleUserFavorite(user.uid, audioId, !isCurrentlyFav);
    } else {
      localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updatedFavs));
    }
  };

  const isFavorite = (audioId: string) => favorites.includes(audioId);

  const toggleSaveSeries = async (seriesId: string) => {
    const isCurrentlySaved = savedSeries.includes(seriesId);
    const updated = isCurrentlySaved
      ? savedSeries.filter((id) => id !== seriesId)
      : [...savedSeries, seriesId];

    setSavedSeries(updated);

    if (user?.uid) {
      await toggleSavedSeries(user.uid, seriesId, !isCurrentlySaved);
    } else {
      localStorage.setItem(LOCAL_SAVED_SERIES_KEY, JSON.stringify(updated));
    }
  };

  const isSeriesSaved = (seriesId: string) => savedSeries.includes(seriesId);

  const createPlaylist = async (name: string, description?: string): Promise<Playlist> => {
    const newPlaylist = await createUserPlaylist(user?.uid || 'guest', name, description);
    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);

    if (!user?.uid) {
      localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(updated));
    }
    return newPlaylist;
  };

  const deletePlaylist = async (playlistId: string) => {
    const updated = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updated);

    if (user?.uid) {
      await deleteUserPlaylist(user.uid, playlistId);
    } else {
      localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(updated));
    }
  };

  const addTrack = async (playlistId: string, audioId: string) => {
    if (user?.uid) {
      await addTrackToPlaylist(user.uid, playlistId, audioId);
    }
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, trackCount: p.trackCount + 1 } : p))
    );
  };

  const removeTrack = async (playlistId: string, audioId: string) => {
    if (user?.uid) {
      await removeTrackFromPlaylist(user.uid, playlistId, audioId);
    }
    setPlaylists((prev) =>
      prev.map((p) => (p.id === playlistId ? { ...p, trackCount: Math.max(0, p.trackCount - 1) } : p))
    );
  };

  return (
    <LibraryContext.Provider
      value={{
        favorites,
        savedSeries,
        history,
        playlists,
        toggleFavorite,
        isFavorite,
        toggleSaveSeries,
        isSeriesSaved,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist: addTrack,
        removeTrackFromPlaylist: removeTrack,
        refreshLibrary,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
