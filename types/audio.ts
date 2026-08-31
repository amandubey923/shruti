export type AudioCategory =
  | 'Discourses'
  | 'Meditation'
  | 'Philosophy'
  | 'Music'
  | 'Audiobooks'
  | 'Podcasts'
  | 'Lectures'
  | 'Chants'
  | 'Interviews';

export interface AudioTrack {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  artistId?: string;
  artistName?: string;
  seriesId?: string;
  seriesName?: string;
  albumId?: string;
  albumName?: string;
  category: AudioCategory | string;
  genre?: string;
  language?: string;
  duration: number; // in seconds
  trackNumber?: number;
  audioUrl: string;
  coverImage?: string; // Optional track-level override; inherits series/album cover by default
  tags?: string[];
  releaseDate?: string;
  isExplicit?: boolean;
  isDownloadable?: boolean;
  published: boolean;
  playCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Series {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  artistId?: string;
  artistName: string;
  category: AudioCategory | string;
  coverImage: string; // The primary, consistent cover image for the entire series
  totalTracks: number;
  totalDuration: number; // in seconds
  trackIds: string[];
  language?: string;
  tags?: string[];
  featured?: boolean;
  published: boolean;
  releaseDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  bio?: string;
  image?: string;
  role?: string;
  trackCount?: number;
  seriesCount?: number;
  tags?: string[];
}

export interface CategoryInfo {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  gradient?: string;
  count?: number;
}

export type RepeatMode = 'off' | 'all' | 'one';
