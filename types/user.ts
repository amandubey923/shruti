export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  preferredSpeed?: number;
  theme?: 'dark' | 'light' | 'system';
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaybackProgress {
  audioId: string;
  lastPosition: number; // in seconds
  duration: number; // in seconds
  lastPlayedAt: string; // ISO string
  completed: boolean;
  trackTitle?: string;
  artistName?: string;
  seriesName?: string;
  coverImage?: string;
  category?: string;
}

export interface UserFavorite {
  audioId: string;
  createdAt: string;
  track?: import('./audio').AudioTrack;
}

export interface SavedSeries {
  seriesId: string;
  savedAt: string;
}

