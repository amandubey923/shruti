'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
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

  // O(1) Sets for high-performance track-list rendering
  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);
  const savedSeriesSet = useMemo(() => new Set(savedSeries), [savedSeries]);

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

  const toggleFavorite = useCallback(async (audioId: string) => {
    setFavorites((prev) => {
      const isCurrentlyFav = prev.includes(audioId);
      const updated = isCurrentlyFav
        ? prev.filter((id) => id !== audioId)
        : [...prev, audioId];

      if (user?.uid) {
        toggleUserFavorite(user.uid, audioId, !isCurrentlyFav);
      } else {
        try {
          localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, [user?.uid]);

  const isFavorite = useCallback((audioId: string) => favoriteSet.has(audioId), [favoriteSet]);

  const toggleSaveSeries = useCallback(async (seriesId: string) => {
    setSavedSeries((prev) => {
      const isCurrentlySaved = prev.includes(seriesId);
      const updated = isCurrentlySaved
        ? prev.filter((id) => id !== seriesId)
        : [...prev, seriesId];

      if (user?.uid) {
        toggleSavedSeries(user.uid, seriesId, !isCurrentlySaved);
      } else {
        try {
          localStorage.setItem(LOCAL_SAVED_SERIES_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  }, [user?.uid]);

  const isSeriesSaved = useCallback((seriesId: string) => savedSeriesSet.has(seriesId), [savedSeriesSet]);

  const createPlaylist = useCallback(async (name: string, description?: string): Promise<Playlist> => {
    const newPlaylist = await createUserPlaylist(user?.uid || 'guest', name, description);
    setPlaylists((prev) => {
      const updated = [newPlaylist, ...prev];
      if (!user?.uid) {
        try {
          localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    return newPlaylist;
  }, [user?.uid]);

  const deletePlaylist = useCallback(async (playlistId: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== playlistId);
      if (!user?.uid) {
        try {
          localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    if (user?.uid) {
      await deleteUserPlaylist(user.uid, playlistId);
    }
  }, [user?.uid]);

  const addTrackToPlaylistAction = useCallback(async (playlistId: string, audioId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        const currentIds = p.trackIds || [];
        if (p.id === playlistId && !currentIds.includes(audioId)) {
          const updated = { ...p, trackIds: [...currentIds, audioId], trackCount: (p.trackCount || 0) + 1 };
          return updated;
        }
        return p;
      })
    );
    if (user?.uid) {
      await addTrackToPlaylist(user.uid, playlistId, audioId);
    } else {
      try {
        setPlaylists((current) => {
          localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(current));
          return current;
        });
      } catch {}
    }
  }, [user?.uid]);

  const removeTrackFromPlaylistAction = useCallback(async (playlistId: string, audioId: string) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const currentIds = p.trackIds || [];
          const updated = {
            ...p,
            trackIds: currentIds.filter((id) => id !== audioId),
            trackCount: Math.max(0, (p.trackCount || 0) - 1),
          };
          return updated;
        }
        return p;
      })
    );
    if (user?.uid) {
      await removeTrackFromPlaylist(user.uid, playlistId, audioId);
    } else {
      try {
        setPlaylists((current) => {
          localStorage.setItem(LOCAL_PLAYLISTS_KEY, JSON.stringify(current));
          return current;
        });
      } catch {}
    }
  }, [user?.uid]);

  const value = useMemo(
    () => ({
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
      addTrackToPlaylist: addTrackToPlaylistAction,
      removeTrackFromPlaylist: removeTrackFromPlaylistAction,
      refreshLibrary,
    }),
    [
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
      addTrackToPlaylistAction,
      removeTrackFromPlaylistAction,
      refreshLibrary,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>
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
