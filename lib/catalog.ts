/**
 * SHRUTI — Multi-Source Merged Audio Catalog
 *
 * ─── ARCHITECTURE ──────────────────────────────────────────────────────────────
 * Step 1 — Scan each Supabase source COMPLETELY and INDEPENDENTLY.
 *           Each source produces its own { folder → tracks[] } map.
 *           - Supabase #1: original verified archive (canonical tracks + dynamic listing).
 *           - Supabase #2: additional archive (dynamic listing of newly uploaded files).
 * Step 2 — MERGE all per-source maps AFTER all scans complete.
 *           Source order (supabaseSources[]) is preserved: #1 wins on deduplication.
 * Step 3 — All 12 canonical series are represented in the catalog.
 * Step 4 — Durations: verified tracks keep their measured duration; new tracks
 *           resolve real duration lazily via HTML5 Audio preload="metadata".
 *
 * ─── DEDUPLICATION ────────────────────────────────────────────────────────────
 * Track ID = seriesId + paddedPartNumber (e.g. "mahaveer-vani-21").
 * First writer wins — source #1 is processed before source #2.
 */

import { AudioTrack, Series } from '@/types/audio';
import { supabaseSources, getSupabaseAudioUrl, AUDIO_BUCKET } from './supabase';
import { SEED_TRACKS, SEED_SERIES } from './seedData';

// ── Seed lookups: metadata enrichment ─────────────────────────────────────────
const seedTrackByPath = new Map<string, AudioTrack>(
  SEED_TRACKS.map((t) => [t.audioUrl, t])
);
const seedSeriesById = new Map<string, Series>(
  SEED_SERIES.map((s) => [s.id, s])
);

// ── Folder→SeriesID hint map ───────────────────────────────────────────────────
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

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 100;
type Src = (typeof supabaseSources)[number];
type RawItem = { name: string; id?: string | null };

// ── Session cache + promise singleton ─────────────────────────────────────────
let catalogCache: { tracks: AudioTrack[]; series: Series[] } | null = null;
let catalogBuildPromise: Promise<{ tracks: AudioTrack[]; series: Series[] }> | null = null;

export async function getMergedCatalog(): Promise<{ tracks: AudioTrack[]; series: Series[] }> {
  if (catalogCache) return catalogCache;
  if (catalogBuildPromise) return catalogBuildPromise;

  catalogBuildPromise = buildCatalog();
  catalogCache = await catalogBuildPromise;
  catalogBuildPromise = null;
  return catalogCache;
}

export function invalidateCatalogCache(): void {
  catalogCache = null;
  catalogBuildPromise = null;
}

// ── Raw REST fetch (fallback when SDK list() returns empty) ───────────────────

async function fetchOnePage(
  url: string,
  key: string,
  prefix: string,
  offset: number
): Promise<RawItem[]> {
  try {
    const res = await fetch(`${url}/storage/v1/object/list/${AUDIO_BUCKET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        apikey: key,
      },
      body: JSON.stringify({
        prefix,
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as RawItem[]) : [];
  } catch {
    return [];
  }
}

// ── Paginated listing: SDK first, raw fetch fallback ─────────────────────────

async function listAllItemsPaginated(src: Src, prefix: string): Promise<RawItem[]> {
  if (!src.isConfigured) return [];

  const collected: RawItem[] = [];
  let offset = 0;

  // Primary: Supabase JS SDK
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const { data, error } = await src.client.storage
        .from(AUDIO_BUCKET)
        .list(prefix, { limit: PAGE_SIZE, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error || !data) break;
      collected.push(...(data as RawItem[]));
      if (data.length < PAGE_SIZE) break;
      offset += data.length;
    } catch {
      break;
    }
  }

  // Fallback: raw fetch with explicit auth headers
  if (collected.length === 0 && src.publishableKey) {
    offset = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const page = await fetchOnePage(src.url, src.publishableKey, prefix, offset);
      if (page.length === 0) break;
      collected.push(...page);
      if (page.length < PAGE_SIZE) break;
      offset += page.length;
    }
  }

  return collected;
}

// ── Per-folder MP3 lister ─────────────────────────────────────────────────────

async function listFolderMp3s(
  src: Src,
  folderPath: string
): Promise<Array<{ name: string; url: string }>> {
  const items = await listAllItemsPaginated(src, folderPath);
  return items
    .filter((f) => f.name?.toLowerCase().endsWith('.mp3'))
    .map((f) => ({
      name: f.name,
      url: getSupabaseAudioUrl(`${folderPath}/${f.name}`, src.url),
    }));
}

// ── Track builder ─────────────────────────────────────────────────────────────

function buildTrack(
  fileName: string,
  folderName: string,
  seriesId: string,
  fullUrl: string
): AudioTrack | null {
  if (!fileName.toLowerCase().endsWith('.mp3')) return null;

  // Check seedData by path for metadata enrichment (title, duration, etc.)
  const storagePath = `osho/${folderName}/${fileName}`;
  const existing = seedTrackByPath.get(storagePath);
  if (existing) return { ...existing, audioUrl: fullUrl };

  // Generate metadata for tracks not in seedData
  const seed = seedSeriesById.get(seriesId);
  const baseName = fileName.replace(/\.mp3$/i, '');
  const partMatch = baseName.match(/[_-]?(\d+)$/);
  const partNum = partMatch ? parseInt(partMatch[1], 10) : 0;
  const partStr = partMatch ? partMatch[1].padStart(2, '0') : baseName.slice(-2);
  const trackId = `${seriesId}-${partStr}`;
  const seriesTitle =
    seed?.title ?? folderName.replace(/^OSHO[-_]?/i, '').replace(/[_-]/g, ' ');

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
    duration: 0,
    audioUrl: fullUrl,
    coverImage: seed?.coverImage ?? '/covers/default-cover.svg',
    category: seed?.category ?? 'Discourses',
    tags: seed?.tags ?? ['Osho', 'Hindi'],
    description: `${seriesTitle} - Part ${partStr}.`,
    isDownloadable: true,
    published: true,
    releaseDate: seed?.releaseDate ?? '',
    language: 'Hindi',
    playCount: 0,
  };
}

// ── Series builder ────────────────────────────────────────────────────────────

function buildSeries(seriesId: string, seriesTracks: AudioTrack[]): Series {
  const seed = seedSeriesById.get(seriesId);
  const title = seed?.title ?? seriesTracks[0]?.seriesName ?? seriesId;
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

// ── Per-source scanner: fully independent scan of one Supabase source ─────────

type SourceScanResult = {
  srcIndex: number;
  tracks: AudioTrack[];
  folderCounts: Record<string, number>;
};

async function scanSource(src: Src): Promise<SourceScanResult> {
  // 1. Discover folders from this source's osho/ prefix
  const oshoItems = await listAllItemsPaginated(src, 'osho');
  const dynamicFolders = oshoItems
    .filter(
      (i) =>
        i.name &&
        i.name !== 'singles' &&
        i.name !== '.emptyFolderPlaceholder' &&
        (i.id === null || i.id === undefined || !i.name.includes('.'))
    )
    .map((i) => i.name);

  // 2. Union with known folders so every series folder is checked
  const allFolders = new Set([...dynamicFolders, ...Object.keys(KNOWN_FOLDER_TO_SERIES_ID)]);

  const tracks: AudioTrack[] = [];
  const folderCounts: Record<string, number> = {};

  await Promise.all(
    Array.from(allFolders).map(async (folderName) => {
      const seriesId = getSeriesId(folderName);
      const folderPath = `osho/${folderName}`;
      const files = await listFolderMp3s(src, folderPath);

      if (src.index === 1) {
        // Supabase #1 holds the canonical archive.
        // If storage.list() returned files, build tracks from them.
        const discovered = files
          .map((f) => buildTrack(f.name, folderName, seriesId, f.url))
          .filter(Boolean) as AudioTrack[];

        // Verified canonical tracks for this series/folder from Supabase #1
        const canonical = SEED_TRACKS.filter((t) => t.seriesId === seriesId).map((t) => ({
          ...t,
          audioUrl: getSupabaseAudioUrl(t.audioUrl, src.url),
        }));

        // Merge: canonical tracks provide verified base, discovered tracks add/override
        const folderTrackMap = new Map<string, AudioTrack>();
        for (const t of canonical) {
          folderTrackMap.set(t.id, t);
        }
        for (const t of discovered) {
          folderTrackMap.set(t.id, t);
        }

        const folderTracks = Array.from(folderTrackMap.values());
        if (folderTracks.length > 0) {
          folderCounts[folderName] = folderTracks.length;
          tracks.push(...folderTracks);
        }
      } else {
        // Secondary source (Supabase #2 etc.): pure dynamic discovery
        if (files.length > 0) {
          folderCounts[folderName] = files.length;
          for (const { name, url } of files) {
            const track = buildTrack(name, folderName, seriesId, url);
            if (track) tracks.push(track);
          }
        }
      }
    })
  );

  return { srcIndex: src.index, tracks, folderCounts };
}

// ── Main catalog builder ──────────────────────────────────────────────────────

async function buildCatalog(): Promise<{ tracks: AudioTrack[]; series: Series[] }> {
  const configuredSources = supabaseSources.filter((s) => s.isConfigured);

  if (configuredSources.length === 0) {
    return { tracks: SEED_TRACKS, series: SEED_SERIES };
  }

  // ── Step 1: Scan every source COMPLETELY and INDEPENDENTLY ────────────────
  const sourceResults = await Promise.all(
    configuredSources.map((src) => scanSource(src))
  );

  // Concise diagnostics requested by user
  const res1 = sourceResults.find((r) => r.srcIndex === 1);
  const res2 = sourceResults.find((r) => r.srcIndex === 2);
  if (res1) {
    console.log(`[catalog] source #1 folders: ${Object.keys(res1.folderCounts).length}`);
    console.log(`[catalog] source #1 tracks: ${res1.tracks.length}`);
  }
  if (res2) {
    console.log(`[catalog] source #2 folders: ${Object.keys(res2.folderCounts).length}`);
    console.log(`[catalog] source #2 tracks: ${res2.tracks.length}`);
  }

  // ── Step 2: Merge all source results — source order preserved (#1 wins dedup) ──
  const trackMap = new Map<string, AudioTrack>();

  for (const { tracks } of sourceResults) {
    for (const track of tracks) {
      if (!trackMap.has(track.id)) {
        trackMap.set(track.id, track);
      }
    }
  }

  console.log(`[catalog] merged tracks: ${trackMap.size}`);

  // ── Step 3: Group by series and ensure all 12 series are represented ─────────
  const seriesTracksMap = new Map<string, AudioTrack[]>();

  for (const track of trackMap.values()) {
    if (!seriesTracksMap.has(track.seriesId)) seriesTracksMap.set(track.seriesId, []);
    seriesTracksMap.get(track.seriesId)!.push(track);
  }

  // Ensure all canonical series exist in the catalog even if they have 0 tracks
  for (const seed of SEED_SERIES) {
    if (!seriesTracksMap.has(seed.id)) {
      seriesTracksMap.set(seed.id, []);
    }
  }

  // ── Step 4: Sort tracks (series then part number) ─────────────────────────
  const tracks = Array.from(trackMap.values()).sort((a, b) => {
    if (a.seriesId !== b.seriesId) return a.seriesId.localeCompare(b.seriesId);
    return (a.trackNumber ?? 0) - (b.trackNumber ?? 0);
  });

  // ── Step 5: Build final series list ──────────────────────────────────────
  const series: Series[] = Array.from(seriesTracksMap.entries()).map(([sid, st]) => {
    // Sort tracks within each series by trackNumber ascending
    st.sort((a, b) => (a.trackNumber ?? 0) - (b.trackNumber ?? 0));
    return buildSeries(sid, st);
  });

  // Sort series by seedData canonical order
  const seedOrder = SEED_SERIES.map((s) => s.id);
  series.sort((a, b) => {
    const ai = seedOrder.indexOf(a.id);
    const bi = seedOrder.indexOf(b.id);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.title.localeCompare(b.title);
  });

  return { tracks, series };
}
