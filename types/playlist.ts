import { AudioTrack } from './audio';

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImage?: string;
  trackCount: number;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  tracks?: AudioTrack[];
}

export interface PlaylistItem {
  audioId: string;
  playlistId: string;
  addedAt: string;
  position: number;
  track?: AudioTrack;
}
