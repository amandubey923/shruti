/**
 * SHRUTI — Multi-Source Merged Audio Catalog
 *
 * Discovers ALL real MP3 files from ALL configured Supabase Storage projects.
 * seedData is ONLY used as a metadata fallback (titles, covers, descriptions).
 * It NEVER limits which folders or files are discovered.
 *
 * ⚠️  SUPABASE RLS REQUIREMENT:
 * For `storage.list()` to work with the anon/publishable key, each Supabase project
 * must have a storage SELECT policy. In Supabase dashboard → Storage → Policies,
 * add the following for the `audio` bucket:
 *
 *   CREATE POLICY "Allow public listing" ON storage.objects
 *   FOR SELECT TO public
 *   USING (bucket_id = 'audio');
 *
 * Without this policy, storage.list() returns an empty array (not an error),
 * causing the catalog to fall back to seedData counts.
 *
 * Principles:
 * - Paginated listing: never truncate at limit; fetch ALL pages
 * - Dynamic folder discovery: lists osho/ from every instance to find all series
 * - Per-source per-folder scan: each source × each folder scanned independently
 * - Merge by track ID: same part from two sources → keep first found (no duplicates)
 * - Full resolved URL per track: correct project used for playback
 * - Duration: NEVER estimated; set to 0 and populated from HTML5 audio at play-time
 * - Single session cache: never rescans after first successful load
 */

import { AudioTrack, Series } from '@/types/audio';
import { supabaseSources, getSupabaseAudioUrl, AUDIO_BUCKET } from './supabase';
import { SEED_TRACKS, SEED_SERIES } from './seedData';

// ── Seed-data lookups (metadata only — NOT discovery constraints) ──────────────
const seedTrackByPath = new Map<string, AudioTrack>(
  SEED_TRACKS.map((t) => [t.audioUrl, t])
);
const seedSeriesById = new Map<string, Series>(
  SEED_SERIES.map((s) => [s.id, s])
);

// ── Known folder → series ID (metadata hint only, NOT discovery limit) ─────────
// Folders NOT listed here are still fully discovered; their ID is derived below.
const KNOWN_FOLDER_TO_SERIES_ID: Record<string, string> = {
  'krishna-smriti':            'krishna-smriti',
  'OSHO-Adhyatam_Upanishad':   'adhyatam-upanishad',
  'OSHO-Asambhav_Kranti':      'asambhav-kranti',
  'OSHO-Bhaj Govindam':        'bhaj-govindam',
  'OSHO-Ek_Omkar_Satnam':      'ek-omkar-satnam',
  'OSHO-Ishavashya_Upanishad': 'ishavashya-upanishad',
  'OSHO-Kaivalya_Upanishad':   'kaivalya-upanishad',
  'OSHO-Mahaveer_Vani':        'mahaveer-vani',
  'OSHO-Mare_He_Jogi_Maro':    'mare-he-jogi-maro',
  'OSHO-Nirvan_Upanishad':     'nirvan-upanishad',
  'OSHO-Sarvasar_Upanishad':   'sarvasar-upanishad',
  'OSHO_ashtavakra-geeta':     'ashtavakra-geeta',
};

/** Derive a URL-safe series ID from any folder name (for unknown/new folders). */
function folderNameToSeriesId(folderName: string): string {
  return folderName
    .replace(/^OSHO[-_]?/i, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function getSeriesId(folderName: string): string {
  return KNOWN_FOLDER_TO_SERIES_ID[folderName] ?? folderNameToSeriesId(folderName);
}

// ── In-memory session cache ────────────────────────────────────────────────────
let catalogCache: { tracks: AudioTrack[]; series: Series[] } | null = null;

// ── Paginated storage listing ──────────────────────────────────────────────────

const PAGE_SIZE = 100; // Conservative page size; we paginate until exhausted

type StorageItem = { name: string; id?: string | null };

/**
 * Paginated list of ALL items under a storage prefix from ONE Supabase source.
 * Handles pagination so no items are missed regardless of total count.
 * Returns [] on any error — never throws.
 */
async function listAllItems(
  src: (typeof supabaseSources)[number],
  prefix: string
): Promise<StorageItem[]> {
  if (!src.isConfigured) return [];

  const all: StorageItem[] = [];
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const { data, error } = await src.client.storage
        .from(AUDIO_BUCKET)
        .list(prefix, {
          limit: PAGE_SIZE,
          offset,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        // Log once per failure so the user can diagnose RLS issues
        if (offset === 0) {
          console.error(
            `[catalog] storage.list() error on Supabase #${src.index} at "${prefix}":`,
            error.message,
            '\n→ Add RLS SELECT policy to the "audio" bucket in Supabase #' + src.index + ' dashboard.'
          );
        }
        break;
      }

      if (!data || data.length === 0) break;

      all.push(...(data as StorageItem[]));

      // If fewer items returned than PAGE_SIZE, we've reached the last page
      if (data.length < PAGE_SIZE) break;

      offset += data.length;
    } catch (err) {
      console.error(`[catalog] storage.list() exception on Supabase #${src.index} at "${prefix}":`, err);
      break;
    }
  }

  return all;
}

/**
 * Discover ALL series folder names under `osho/` from ALL Supabase instances.
 * Unions every folder found dynamically. KNOWN_FOLDER_TO_SERIES_ID is only a
 * safety baseline — it does NOT restrict which new folders are discovered.
 */
async function discoverAllFolders(
  configuredSources: typeof supabaseSources
): Promise<string[]> {
  const folderSet = new Set<string>();

  // Dynamic discovery from every Supabase instance
  const perSourceItems = await Promise.all(
    configuredSources.map(async (src) => {
      const items = await listAllItems(src, 'osho');
      console.log(
        `[catalog] Supabase #${src.index} osho/ list returned ${items.length} item(s):`,
        items.map((i) => i.name).join(', ') || '(none)'
      );
      return items;
    })
  );

  for (const items of perSourceItems) {
    for (const item of items) {
      // In Supabase Storage: id === null/undefined → virtual folder; has id → file
      const isFolder =
        item.id === null ||
        item.id === undefined ||
        !item.name.includes('.');
      if (isFolder && item.name && item.name !== 'singles' && item.name !== '.emptyFolderPlaceholder') {
        folderSet.add(item.name);
      }
    }
  }

  // Baseline: always include known folders so known series always appear
  // even if dynamic listing is blocked by RLS policies
  for (const f of Object.keys(KNOWN_FOLDER_TO_SERIES_ID)) {
    folderSet.add(f);
  }

  const folders = Array.from(folderSet);
  console.log(`[catalog] Total folders to scan: ${folders.length}:`, folders.join(', '));
  return folders;
}

/**
 * List ALL MP3 files in a specific folder from ONE Supabase source.
 * Paginated — fetches every page. Returns [] on error.
 */
async function listFolderMp3s(
  src: (typeof supabaseSources)[number],
  folderPath: string
): Promise<Array<{ name: string; url: string }>> {
  const items = await listAllItems(src, folderPath);
  return items
    .filter((f) => f.name?.toLowerCase().endsWith('.mp3'))
    .map((f) => ({
      name: f.name,
      url: getSupabaseAudioUrl(`${folderPath}/${f.name}`, src.url),
    }));
}

/**
 * Build an AudioTrack from a discovered MP3.
 * Reuses seedData metadata for known tracks; infers metadata for new ones.
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
    return { ...existing, audioUrl: fullUrl };
  }

  const series = seedSeriesById.get(seriesId);
  const baseName = fileName.replace(/\.mp3$/i, '');
  const partMatch = baseName.match(/[_-]?(\d+)$/);
  const partNum = partMatch ? parseInt(partMatch[1], 10) : 0;
  const partStr = partMatch ? partMatch[1].padStart(2, '0') : baseName.slice(-2);
  const trackId = `${seriesId}-${partStr}`;
  const seriesTitle =
    series?.title ?? folderName.replace(/^OSHO[-_]?/i, '').replace(/[_-]/g, ' ');

  return {
    id: trackId,
    title: `${seriesTitle} - Part ${partStr}`,
    subtitle: `Discourse ${partNum || ''}`,
    slug: trackId,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId,
    seriesName: seriesTitle,
    trackNumber: partNum,
    duration: 0, // Set from HTML5 audio metadata on first play
    audioUrl: fullUrl,
    coverImage: series?.coverImage ?? '/covers/default-cover.svg',
    category: series?.category ?? 'Discourses',
    tags: series?.tags ?? ['Osho', 'Hindi'],
    description: `${seriesTitle} - Part ${partStr}.`,
    isDownloadable: true,
    published: true,
    releaseDate: series?.releaseDate ?? '',
    language: 'Hindi',
    playCount: 0,
  };
}

/**
 * Build a Series object from its discovered tracks.
 * Enriches with seedData metadata when available.
 */
function buildSeries(seriesId: string, seriesTracks: AudioTrack[]): Series {
  const seed = seedSeriesById.get(seriesId);
  const firstTrack = seriesTracks[0];
  const title = seed?.title ?? firstTrack?.seriesName ?? seriesId;
  return {
    id: seriesId,
    title,
    subtitle: `${seriesTracks.length} Discourse Recording${seriesTracks.length !== 1 ? 's' : ''}`,
    slug: seed?.slug ?? seriesId,
    artistId: seed?.artistId ?? 'osho',
    artistName: seed?.artistName ?? 'Osho',
    description: seed?.description ?? `Spoken audio discourses: ${title}.`,
    coverImage: seed?.coverImage ?? '/covers/default-cover.svg',
    totalTracks: seriesTracks.length,
    totalDuration: seriesTracks.reduce((sum, t) => sum + (t.duration ?? 0), 0),
    trackIds: seriesTracks.map((t) => t.id),
    category: seed?.category ?? 'Discourses',
    tags: seed?.tags ?? ['Osho', 'Hindi'],
    releaseDate: seed?.releaseDate ?? '',
    published: true,
  };
}

/**
 * Build and cache the merged catalog from all Supabase sources.
 * Falls back to seedData ONLY if ALL sources return zero MP3 files.
 */
export async function getMergedCatalog(): Promise<{ tracks: AudioTrack[]; series: Series[] }> {
  if (catalogCache) return catalogCache;

  const configuredSources = supabaseSources.filter((s) => s.isConfigured);
  console.log(`[catalog] Configured Supabase sources: ${configuredSources.map((s) => `#${s.index} (${s.url})`).join(', ')}`);

  if (configuredSources.length === 0) {
    console.warn('[catalog] No Supabase sources configured — using seedData.');
    catalogCache = { tracks: SEED_TRACKS, series: SEED_SERIES };
    return catalogCache;
  }

  // ── Step 1: Discover ALL folder names from ALL sources ──────────────────────
  const allFolders = await discoverAllFolders(configuredSources);

  // ── Step 2: For each folder, collect MP3s from ALL sources ─────────────────
  const trackMap = new Map<string, AudioTrack>();
  const sourceFileCounts: number[] = configuredSources.map(() => 0);

  await Promise.all(
    allFolders.map(async (folderName) => {
      const seriesId = getSeriesId(folderName);
      const folderPath = `osho/${folderName}`;

      const perSourceFiles = await Promise.all(
        configuredSources.map((src, i) =>
          listFolderMp3s(src, folderPath).then((files) => {
            sourceFileCounts[i] += files.length;
            return { files, srcIndex: src.index };
          })
        )
      );

      for (const { files, srcIndex } of perSourceFiles) {
        if (files.length > 0) {
          console.log(`[catalog] Supabase #${srcIndex} ${folderPath}: ${files.length} MP3(s)`);
        }
        for (const { name, url } of files) {
          const track = buildTrack(name, folderName, seriesId, url);
          if (track && !trackMap.has(track.id)) {
            trackMap.set(track.id, track);
          }
        }
      }
    })
  );

  // Log per-source totals
  configuredSources.forEach((src, i) => {
    console.log(`[catalog] Supabase #${src.index} total MP3s found: ${sourceFileCounts[i]}`);
  });
  console.log(`[catalog] Total merged unique tracks: ${trackMap.size}`);

  // ── Step 3: Fall back to seedData ONLY if nothing was found anywhere ────────
  if (trackMap.size === 0) {
    console.warn(
      '[catalog] Zero MP3s found from any Supabase source.\n' +
      '→ Possible causes:\n' +
      '  1. Missing RLS SELECT policy on storage.objects in Supabase dashboard\n' +
      '  2. Bucket name mismatch (expected: "audio")\n' +
      '  3. Files not yet uploaded\n' +
      'Falling back to seedData.'
    );
    catalogCache = { tracks: SEED_TRACKS, series: SEED_SERIES };
    return catalogCache;
  }

  // ── Step 4: Sort tracks by series + part number ──────────────────────────────
  const tracks = Array.from(trackMap.values()).sort((a, b) => {
    if (a.seriesId !== b.seriesId) return a.seriesId.localeCompare(b.seriesId);
    return (a.trackNumber ?? 0) - (b.trackNumber ?? 0);
  });

  // ── Step 5: Build Series for every discovered series ────────────────────────
  const seriesTracksMap = new Map<string, AudioTrack[]>();
  for (const t of tracks) {
    if (!seriesTracksMap.has(t.seriesId)) seriesTracksMap.set(t.seriesId, []);
    seriesTracksMap.get(t.seriesId)!.push(t);
  }

  const series: Series[] = Array.from(seriesTracksMap.entries()).map(([sid, sTracks]) =>
    buildSeries(sid, sTracks)
  );

  // Sort: seed-known series in seed order first, then new series alphabetically
  const seedOrder = SEED_SERIES.map((s) => s.id);
  series.sort((a, b) => {
    const ai = seedOrder.indexOf(a.id);
    const bi = seedOrder.indexOf(b.id);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  catalogCache = { tracks, series };
  return catalogCache;
}

/** Invalidate the session cache (call after new files are uploaded mid-session). */
export function invalidateCatalogCache(): void {
  catalogCache = null;
}
