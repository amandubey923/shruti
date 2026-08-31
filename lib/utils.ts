import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AudioTrack, Series, Artist } from '@/types/audio';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format duration in seconds to "MM:SS" or "HH:MM:SS"
 */
export function formatDuration(seconds: number = 0): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format duration to human readable format (e.g. "1 hr 15 min" or "45 min")
 */
export function formatDurationHuman(seconds: number = 0): string {
  if (isNaN(seconds) || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs} hr ${mins} min`;
  }
  if (hrs > 0) {
    return `${hrs} hr`;
  }
  return `${mins} min`;
}

/**
 * Format a date string to a clean editorial format (e.g., "Oct 12, 2024")
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Convert string to clean slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Deterministic Artwork Hierarchy:
 * 1. Explicit track cover override if defined
 * 2. Parent Series cover image (Shared by ALL episodes/parts of that series)
 * 3. Artist / Speaker portrait
 * 4. Fallback archival cover
 */
export function resolveTrackCover(
  track: AudioTrack | null | undefined,
  seriesList?: Series[],
  artists?: Artist[]
): string {
  if (!track) return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop';
  
  if (track.coverImage) return track.coverImage;

  if (track.seriesId && seriesList) {
    const matchedSeries = seriesList.find((s) => s.id === track.seriesId || s.slug === track.seriesId);
    if (matchedSeries?.coverImage) return matchedSeries.coverImage;
  }

  if (track.artistId && artists) {
    const matchedArtist = artists.find((a) => a.id === track.artistId || a.slug === track.artistId);
    if (matchedArtist?.image) return matchedArtist.image;
  }

  return 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop';
}
