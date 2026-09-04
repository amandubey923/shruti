import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { AudioTrack, Series, Artist, CategoryInfo } from '@/types/audio';
import { PlaybackProgress } from '@/types/user';
import { Playlist } from '@/types/playlist';
import { SEED_TRACKS, SEED_SERIES, SEED_ARTISTS, SEED_CATEGORIES } from './seedData';
import { getMergedCatalog } from './catalog';

/* =========================================================================
   IN-MEMORY CACHING LAYER FOR HIGH PERFORMANCE
   ========================================================================= */
let cachedTracks: AudioTrack[] | null = null;
let cachedSeries: Series[] | null = null;

/* =========================================================================
   PUBLIC CATALOG DATA (Audio, Series, Artists, Categories)
   ========================================================================= */

export async function getAllTracks(): Promise<AudioTrack[]> {
  if (cachedTracks) return cachedTracks;

  // Try merged multi-Supabase catalog first (falls back to seed internally)
  const { tracks } = await getMergedCatalog();
  if (tracks.length > 0) {
    cachedTracks = tracks;
    return cachedTracks;
  }

  // Final fallback: seedData
  if (!isFirebaseConfigured) {
    cachedTracks = SEED_TRACKS;
    return cachedTracks;
  }
  try {
    const snap = await getDocs(query(collection(db, 'audio'), where('published', '==', true)));
    cachedTracks = snap.empty
      ? SEED_TRACKS
      : snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioTrack));
    return cachedTracks;
  } catch (err) {
    console.warn('Firestore fetch tracks failed, using seed data fallback:', err);
    cachedTracks = SEED_TRACKS;
    return cachedTracks;
  }
}

export async function getTrackById(id: string): Promise<AudioTrack | null> {
  const all = await getAllTracks();
  const matched = all.find((t) => t.id === id || t.slug === id);
  if (matched) return matched;

  if (!isFirebaseConfigured) {
    return SEED_TRACKS.find((t) => t.id === id || t.slug === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, 'audio', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AudioTrack;
    }
    const qSnap = await getDocs(query(collection(db, 'audio'), where('slug', '==', id), limit(1)));
    if (!qSnap.empty) {
      const d = qSnap.docs[0];
      return { id: d.id, ...d.data() } as AudioTrack;
    }
    return null;
  } catch (err) {
    console.warn('Firestore getTrackById failed, using fallback:', err);
    return null;
  }
}

export async function getAllSeries(): Promise<Series[]> {
  if (cachedSeries) return cachedSeries;

  // Try merged multi-Supabase catalog first
  const { series } = await getMergedCatalog();
  if (series.length > 0) {
    cachedSeries = series;
    return cachedSeries;
  }

  // Final fallback: seedData
  if (!isFirebaseConfigured) {
    cachedSeries = SEED_SERIES;
    return cachedSeries;
  }
  try {
    const snap = await getDocs(query(collection(db, 'series'), where('published', '==', true)));
    cachedSeries = snap.empty
      ? SEED_SERIES
      : snap.docs.map((d) => ({ id: d.id, ...d.data() } as Series));
    return cachedSeries;
  } catch (err) {
    console.warn('Firestore fetch series failed, using fallback:', err);
    cachedSeries = SEED_SERIES;
    return cachedSeries;
  }
}

function normalizeSeriesId(id: string): string {
  const clean = id.toLowerCase().trim();
  if (
    clean.includes('ashtavakra') ||
    clean.includes('mahageeta') ||
    clean.includes('maha-geeta') ||
    clean.includes('maha_geeta')
  ) {
    return 'ashtavakra-geeta';
  }
  if (clean.includes('saravsar') || clean.includes('sarvasar')) {
    return 'sarvasar-upanishad';
  }
  return id;
}

export async function getSeriesById(id: string): Promise<Series | null> {
  const normId = normalizeSeriesId(id);
  const all = await getAllSeries();
  const matched = all.find(
    (s) => s.id === normId || s.slug === normId || s.id === id || s.slug === id
  );
  if (matched) return matched;

  if (!isFirebaseConfigured) {
    return (
      SEED_SERIES.find(
        (s) => s.id === normId || s.slug === normId || s.id === id || s.slug === id
      ) || null
    );
  }
  try {
    const snap = await getDoc(doc(db, 'series', normId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Series;
    }
    const qSnap = await getDocs(query(collection(db, 'series'), where('slug', '==', normId), limit(1)));
    if (!qSnap.empty) {
      const d = qSnap.docs[0];
      return { id: d.id, ...d.data() } as Series;
    }
    return null;
  } catch (err) {
    console.warn('Firestore getSeriesById failed, using fallback:', err);
    return null;
  }
}

export async function getTracksForSeries(seriesId: string): Promise<AudioTrack[]> {
  const normId = normalizeSeriesId(seriesId);
  const all = await getAllTracks();
  return all
    .filter((t) => t.seriesId === normId || t.seriesId === seriesId)
    .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
}

export function getAllCategories(): CategoryInfo[] {
  return SEED_CATEGORIES;
}

export async function getAllArtists(): Promise<Artist[]> {
  return SEED_ARTISTS;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  return SEED_ARTISTS.find((a) => a.id === id || a.slug === id) || null;
}

/* =========================================================================
   USER PLAYBACK PROGRESS & RESUME (Firestore Sync)
   ========================================================================= */

export async function saveUserProgress(
  userId: string,
  progress: PlaybackProgress
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const ref = doc(db, 'users', userId, 'progress', progress.audioId);
    await setDoc(
      ref,
      {
        ...progress,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Failed to save progress to Firestore:', err);
  }
}

export async function getUserHistory(userId: string): Promise<PlaybackProgress[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const colRef = collection(db, 'users', userId, 'progress');
    const snap = await getDocs(colRef);
    const list = snap.docs.map((d) => d.data() as PlaybackProgress);
    return list.sort((a, b) => {
      const timeA = a.lastPlayedAt ? new Date(a.lastPlayedAt).getTime() : 0;
      const timeB = b.lastPlayedAt ? new Date(b.lastPlayedAt).getTime() : 0;
      return timeB - timeA;
    });
  } catch (err) {
    console.warn('Failed to load history from Firestore:', err);
    return [];
  }
}

/* =========================================================================
   USER FAVORITES (Firestore Sync)
   ========================================================================= */

export async function getUserFavorites(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.warn('Failed to load favorites from Firestore:', err);
    return [];
  }
}

export async function toggleUserFavorite(
  userId: string,
  audioId: string,
  isFav: boolean
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const ref = doc(db, 'users', userId, 'favorites', audioId);
    if (isFav) {
      await setDoc(ref, {
        audioId,
        createdAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('Failed to update favorite in Firestore:', err);
  }
}

/* =========================================================================
   USER SAVED SERIES / BOOKMARKS (Firestore Sync)
   ========================================================================= */

export async function getUserSavedSeries(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'saved_series'));
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.warn('Failed to load saved series from Firestore:', err);
    return [];
  }
}

export async function toggleSavedSeries(
  userId: string,
  seriesId: string,
  isSaved: boolean
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const ref = doc(db, 'users', userId, 'saved_series', seriesId);
    if (isSaved) {
      await setDoc(ref, {
        seriesId,
        savedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(ref);
    }
  } catch (err) {
    console.warn('Failed to update saved series in Firestore:', err);
  }
}

/* =========================================================================
   USER PLAYLISTS (Firestore Sync)
   ========================================================================= */

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const q = query(
      collection(db, 'users', userId, 'playlists'),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Playlist));
  } catch (err) {
    console.warn('Failed to load playlists from Firestore:', err);
    return [];
  }
}

export async function createUserPlaylist(
  userId: string,
  title: string,
  description?: string
): Promise<Playlist> {
  const newId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const playlist: Playlist = {
    id: newId,
    userId,
    name: title,
    title,
    description: description || '',
    trackIds: [],
    trackCount: 0,
    totalDuration: 0,
    coverImage: '/covers/default-cover.svg',
    isPublic: false,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && userId && userId !== 'guest') {
    try {
      await setDoc(doc(db, 'users', userId, 'playlists', newId), playlist);
    } catch (err) {
      console.warn('Failed to save new playlist to Firestore:', err);
    }
  }

  return playlist;
}

export async function deleteUserPlaylist(userId: string, playlistId: string): Promise<void> {
  if (!isFirebaseConfigured || !userId || userId === 'guest') return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'playlists', playlistId));
  } catch (err) {
    console.warn('Failed to delete playlist from Firestore:', err);
  }
}

export async function addTrackToPlaylist(
  userId: string,
  playlistId: string,
  audioId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId || userId === 'guest') return;
  try {
    const pRef = doc(db, 'users', userId, 'playlists', playlistId);
    const snap = await getDoc(pRef);
    if (snap.exists()) {
      const data = snap.data() as Playlist;
      const currentIds = data.trackIds || [];
      if (!currentIds.includes(audioId)) {
        const updatedTrackIds = [...currentIds, audioId];
        await setDoc(
          pRef,
          {
            trackIds: updatedTrackIds,
            trackCount: updatedTrackIds.length,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }
  } catch (err) {
    console.warn('Failed to add track to playlist in Firestore:', err);
  }
}

export async function removeTrackFromPlaylist(
  userId: string,
  playlistId: string,
  audioId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId || userId === 'guest') return;
  try {
    const pRef = doc(db, 'users', userId, 'playlists', playlistId);
    const snap = await getDoc(pRef);
    if (snap.exists()) {
      const data = snap.data() as Playlist;
      const currentIds = data.trackIds || [];
      const updatedTrackIds = currentIds.filter((id) => id !== audioId);
      await setDoc(
        pRef,
        {
          trackIds: updatedTrackIds,
          trackCount: updatedTrackIds.length,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Failed to remove track from playlist in Firestore:', err);
  }
}

export async function getPlaylistItems(userId: string, playlistId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId || userId === 'guest') return [];
  try {
    const pRef = doc(db, 'users', userId, 'playlists', playlistId);
    const snap = await getDoc(pRef);
    if (snap.exists()) {
      return (snap.data() as Playlist).trackIds || [];
    }
    return [];
  } catch (err) {
    console.warn('Failed to get playlist items:', err);
    return [];
  }
}
