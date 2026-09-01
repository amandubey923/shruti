/**
 * SHRUTI — Multi-Source Merged Audio Catalog
 *
 * Dynamically discovers real MP3 files from ALL configured Supabase Storage
 * projects and merges them into a single unified catalog.
 *
 * Design principles:
 * - Single in-memory cache per session (never rescans after first load)
 * - Falls back to seedData if storage listing is unavailable
 * - Same series parts from different Supabase projects are merged into one series
 * - Full resolved URLs stored per track so playback always hits the right project
 * - Duration is NEVER estimated from file size; HTML5 audio metadata is used at play-time
 * - Extensible: add more Supabase sources to `supabaseSources` in supabase.ts
 */

import { AudioTrack, Series } from '@/types/audio';
import {
  supabaseSources,
  getSupabaseAudioUrl,
  AUDIO_BUCKET,
} from './supabase';
import { SEED_TRACKS, SEED_SERIES } from './seedData';

// ── Folder → Series ID mapping ─────────────────────────────────────────────
// Maps each Supabase storage folder name under `osho/` to its canonical series ID.
const FOLDER_TO_SERIES_ID: Record<string, string> = {
  'krishna-smriti':          'krishna-smriti',
  'OSHO-Adhyatam_Upanishad': 'adhyatam-upanishad',
  'OSHO-Asambhav_Kranti':    'asambhav-kranti',
  'OSHO-Bhaj Govindam':      'bhaj-govindam',
  'OSHO-Ek_Omkar_Satnam':    'ek-omkar-satnam',
  'OSHO-Ishavashya_Upanishad': 'ishavashya-upanishad',
  'OSHO-Kaivalya_Upanishad': 'kaivalya-upanishad',
  'OSHO-Mahaveer_Vani':      'mahaveer-vani',
  'OSHO-Mare_He_Jogi_Maro':  'mare-he-jogi-maro',
  'OSHO-Nirvan_Upanishad':   'nirvan-upanishad',
  'OSHO-Sarvasar_Upanishad': 'sarvasar-upanishad',
  'OSHO_ashtavakra-geeta':   'ashtavakra-geeta',
};

// Pre-built lookup: seedData track by its audioUrl path (for metadata reuse)
const seedTrackByPath = new Map<string, AudioTrack>(
  SEED_TRACKS.map((t) => [t.audioUrl, t])
);

// Pre-built lookup: series metadata by series ID
const seedSeriesById = new Map<string, Series>(
  SEED_SERIES.map((s) => [s.id, s])
);

// ── In-memory catalog cache ────────────────────────────────────────────────
let catalogCache: { tracks: AudioTrack[]; series: Series[] } | null = null;

/**
 * Build a track object from a discovered MP3 file.
 * Reuses seedData metadata when the file is already catalogued.
 * Falls back to inferred metadata for newly uploaded files.
 */
function buildTrack(
  fileName: string,
  folderName: string,
  seriesId: string,
  fullUrl: string
): AudioTrack | null {
  if (!fileName.toLowerCase().endsWith('.mp3')) return null;

  const storagePath = `osho/${folderName}/${fileName}`;
  const existing = seedTrackByPath.get(storagePath);
  if (existing) {
    // Reuse seed metadata but override audioUrl with the full resolved URL
    return { ...existing, audioUrl: fullUrl };
  }

  // New file not in seedData — infer minimal metadata from filename
  const series = seedSeriesById.get(seriesId);
  const baseName = fileName.replace(/\.mp3$/i, '');

  // Extract part number: look for trailing _NN or -NN or NN at end of filename
  const partMatch = baseName.match(/[_-]?(\d+)$/);
  const partNum = partMatch ? parseInt(partMatch[1], 10) : 0;
  const partStr = partMatch ? partMatch[1].padStart(2, '0') : '00';

  const trackId = `${seriesId}-${partStr}`;
  return {
    id: trackId,
    title: `${series?.title ?? seriesId} - Part ${partStr}`,
    subtitle: `Discourse ${partNum || ''}`,
    slug: trackId,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId,
    seriesName: series?.title ?? seriesId,
    trackNumber: partNum,
    duration: 0, // Will be set from HTML5 audio metadata on first play
    audioUrl: fullUrl,
    coverImage: series?.coverImage ?? '/covers/default-cover.svg',
    category: series?.category ?? 'Discourses',
    tags: series?.tags ?? ['Osho', 'Hindi'],
    description: `${series?.title ?? seriesId} - Part ${partStr}.`,
    isDownloadable: true,
    published: true,
    releaseDate: series?.releaseDate ?? '',
    language: 'Hindi',
    playCount: 0,
  };
}

/**
 * List MP3 files in a single storage folder from a single Supabase source.
 * Returns empty array on any failure — never throws.
 */
async function listFolderMp3s(
  sourceClient: (typeof supabaseSources)[number],
  folderPath: string
): Promise<Array<{ name: string; url: string }>> {
  if (!sourceClient.isConfigured) return [];
  try {
    const { data, error } = await sourceClient.client.storage
      .from(AUDIO_BUCKET)
      .list(folderPath, { limit: 200, sortBy: { column: 'name', order: 'asc' } });
    if (error || !data) return [];
    return data
      .filter((f) => f.name?.toLowerCase().endsWith('.mp3'))
      .map((f) => ({
        name: f.name,
        url: getSupabaseAudioUrl(`${folderPath}/${f.name}`, sourceClient.url),
      }));
  } catch {
    return [];
  }
}

/**
 * Scan ALL configured Supabase sources, discover real MP3 files,
 * and return a merged catalog. Results are cached for the session.
 */
export async function getMergedCatalog(): Promise<{ tracks: AudioTrack[]; series: Series[] }> {
  if (catalogCache) return catalogCache;

  const configuredSources = supabaseSources.filter((s) => s.isConfigured);

  // If no Supabase is configured, fall back to seed data immediately
  if (configuredSources.length === 0) {
    catalogCache = { tracks: SEED_TRACKS, series: SEED_SERIES };
    return catalogCache;
  }

  // Collect discovered tracks keyed by track ID to deduplicate across sources
  const trackMap = new Map<string, AudioTrack>();

  // For each series folder, scan all sources in parallel
  const folderNames = Object.keys(FOLDER_TO_SERIES_ID);

  await Promise.all(
    folderNames.map(async (folderName) => {
      const seriesId = FOLDER_TO_SERIES_ID[folderName];
      const folderPath = `osho/${folderName}`;

      // Scan every configured source for this folder
      const allFiles = await Promise.all(
        configuredSources.map((src) => listFolderMp3s(src, folderPath))
      );

      for (const files of allFiles) {
        for (const { name, url } of files) {
          const track = buildTrack(name, folderName, seriesId, url);
          if (!track) continue;
          // Deduplicate: if same track ID already found (from another source), keep it (first found wins)
          if (!trackMap.has(track.id)) {
            trackMap.set(track.id, track);
          }
        }
      }
    })
  );

  // If storage listing produced no results (e.g., RLS blocks listing),
  // fall back to seed data so the app always shows something.
  if (trackMap.size === 0) {
    console.warn('[catalog] Storage listing returned no files; falling back to seedData.');
    catalogCache = { tracks: SEED_TRACKS, series: SEED_SERIES };
    return catalogCache;
  }

  // Build final tracks array sorted by series + track number
  const tracks = Array.from(trackMap.values()).sort((a, b) => {
    if (a.seriesId !== b.seriesId) return a.seriesId.localeCompare(b.seriesId);
    return (a.trackNumber ?? 0) - (b.trackNumber ?? 0);
  });

  // Rebuild series with correct track counts from discovered tracks
  const seriesMap = new Map<string, AudioTrack[]>();
  for (const t of tracks) {
    if (!seriesMap.has(t.seriesId)) seriesMap.set(t.seriesId, []);
    seriesMap.get(t.seriesId)!.push(t);
  }

  const series: Series[] = SEED_SERIES.map((s) => {
    const seriesTracks = seriesMap.get(s.id) ?? [];
    return {
      ...s,
      totalTracks: seriesTracks.length,
      totalDuration: seriesTracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
      trackIds: seriesTracks.map((t) => t.id),
    };
  });

  catalogCache = { tracks, series };
  return catalogCache;
}

/** Invalidate the cache (call if new files are uploaded mid-session). */
export function invalidateCatalogCache(): void {
  catalogCache = null;
}

