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

/* =========================================================================
   PUBLIC CATALOG DATA (Audio, Series, Artists, Categories)
   ========================================================================= */

export async function getAllTracks(): Promise<AudioTrack[]> {
  if (!isFirebaseConfigured) {
    return SEED_TRACKS;
  }
  try {
    const snap = await getDocs(query(collection(db, 'audio'), where('published', '==', true)));
    if (snap.empty) return SEED_TRACKS;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AudioTrack));
  } catch (err) {
    console.warn('Firestore fetch tracks failed, using seed data fallback:', err);
    return SEED_TRACKS;
  }
}

export async function getTrackById(id: string): Promise<AudioTrack | null> {
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
    return SEED_TRACKS.find((t) => t.id === id || t.slug === id) || null;
  } catch (err) {
    console.warn('Firestore getTrackById failed, using fallback:', err);
    return SEED_TRACKS.find((t) => t.id === id || t.slug === id) || null;
  }
}

export async function getAllSeries(): Promise<Series[]> {
  if (!isFirebaseConfigured) {
    return SEED_SERIES;
  }
  try {
    const snap = await getDocs(query(collection(db, 'series'), where('published', '==', true)));
    if (snap.empty) return SEED_SERIES;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Series));
  } catch (err) {
    console.warn('Firestore fetch series failed, using fallback:', err);
    return SEED_SERIES;
  }
}

export async function getSeriesById(id: string): Promise<Series | null> {
  if (!isFirebaseConfigured) {
    return SEED_SERIES.find((s) => s.id === id || s.slug === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, 'series', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Series;
    }
    const qSnap = await getDocs(query(collection(db, 'series'), where('slug', '==', id), limit(1)));
    if (!qSnap.empty) {
      const d = qSnap.docs[0];
      return { id: d.id, ...d.data() } as Series;
    }
    return SEED_SERIES.find((s) => s.id === id || s.slug === id) || null;
  } catch (err) {
    console.warn('Firestore getSeriesById failed, using fallback:', err);
    return SEED_SERIES.find((s) => s.id === id || s.slug === id) || null;
  }
}

export async function getTracksForSeries(seriesId: string): Promise<AudioTrack[]> {
  const all = await getAllTracks();
  return all
    .filter((t) => t.seriesId === seriesId)
    .sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
}

export async function getAllArtists(): Promise<Artist[]> {
  if (!isFirebaseConfigured) {
    return SEED_ARTISTS;
  }
  try {
    const snap = await getDocs(collection(db, 'artists'));
    if (snap.empty) return SEED_ARTISTS;
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Artist));
  } catch (err) {
    console.warn('Firestore fetch artists failed, using fallback:', err);
    return SEED_ARTISTS;
  }
}

export async function getArtistById(id: string): Promise<Artist | null> {
  if (!isFirebaseConfigured) {
    return SEED_ARTISTS.find((a) => a.id === id || a.slug === id) || null;
  }
  try {
    const snap = await getDoc(doc(db, 'artists', id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Artist;
    }
    const qSnap = await getDocs(query(collection(db, 'artists'), where('slug', '==', id), limit(1)));
    if (!qSnap.empty) {
      const d = qSnap.docs[0];
      return { id: d.id, ...d.data() } as Artist;
    }
    return SEED_ARTISTS.find((a) => a.id === id || a.slug === id) || null;
  } catch (err) {
    console.warn('Firestore getArtistById failed, using fallback:', err);
    return SEED_ARTISTS.find((a) => a.id === id || a.slug === id) || null;
  }
}

export function getAllCategories(): CategoryInfo[] {
  return SEED_CATEGORIES;
}

/* =========================================================================
   USER DATA (Scoped by userId)
   ========================================================================= */

export async function saveUserProgress(
  userId: string,
  progress: PlaybackProgress
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const docRef = doc(db, 'users', userId, 'history', progress.audioId);
    await setDoc(docRef, {
      ...progress,
      lastPlayedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.error('Error saving user progress to Firestore:', err);
  }
}

export async function getUserHistory(userId: string): Promise<PlaybackProgress[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(
      query(collection(db, 'users', userId, 'history'), orderBy('lastPlayedAt', 'desc'), limit(30))
    );
    return snap.docs.map((d) => d.data() as PlaybackProgress);
  } catch (err) {
    console.warn('Error fetching user history:', err);
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
    const docRef = doc(db, 'users', userId, 'favorites', audioId);
    if (isFav) {
      await setDoc(docRef, {
        audioId,
        createdAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.error('Error toggling favorite in Firestore:', err);
  }
}

export async function getUserFavorites(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'favorites'));
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.warn('Error fetching user favorites:', err);
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
    const docRef = doc(db, 'users', userId, 'savedSeries', seriesId);
    if (isSaved) {
      await setDoc(docRef, {
        seriesId,
        savedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(docRef);
    }
  } catch (err) {
    console.error('Error saving series in Firestore:', err);
  }
}

export async function getUserSavedSeries(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'savedSeries'));
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.warn('Error fetching saved series:', err);
    return [];
  }
}

export async function createUserPlaylist(
  userId: string,
  name: string,
  description?: string
): Promise<Playlist> {
  const playlistId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const newPl: Playlist = {
    id: playlistId,
    userId,
    name,
    description: description || '',
    trackCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  if (isFirebaseConfigured && userId) {
    try {
      await setDoc(doc(db, 'users', userId, 'playlists', playlistId), newPl);
    } catch (err) {
      console.error('Error creating playlist in Firestore:', err);
    }
  }
  return newPl;
}

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(query(collection(db, 'users', userId, 'playlists'), orderBy('updatedAt', 'desc')));
    return snap.docs.map((d) => d.data() as Playlist);
  } catch (err) {
    console.warn('Error fetching user playlists:', err);
    return [];
  }
}

export async function addTrackToPlaylist(
  userId: string,
  playlistId: string,
  audioId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const itemRef = doc(db, 'users', userId, 'playlists', playlistId, 'items', audioId);
    await setDoc(itemRef, {
      audioId,
      playlistId,
      addedAt: new Date().toISOString(),
      position: Date.now(),
    });
  } catch (err) {
    console.error('Error adding track to playlist in Firestore:', err);
  }
}

export async function removeTrackFromPlaylist(
  userId: string,
  playlistId: string,
  audioId: string
): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    const itemRef = doc(db, 'users', userId, 'playlists', playlistId, 'items', audioId);
    await deleteDoc(itemRef);
  } catch (err) {
    console.error('Error removing track from playlist in Firestore:', err);
  }
}

export async function getPlaylistItems(userId: string, playlistId: string): Promise<string[]> {
  if (!isFirebaseConfigured || !userId) return [];
  try {
    const snap = await getDocs(
      query(collection(db, 'users', userId, 'playlists', playlistId, 'items'), orderBy('position', 'asc'))
    );
    return snap.docs.map((d) => d.id);
  } catch (err) {
    console.warn('Error fetching playlist items:', err);
    return [];
  }
}

export async function deleteUserPlaylist(userId: string, playlistId: string): Promise<void> {
  if (!isFirebaseConfigured || !userId) return;
  try {
    await deleteDoc(doc(db, 'users', userId, 'playlists', playlistId));
  } catch (err) {
    console.error('Error deleting playlist from Firestore:', err);
  }
}
