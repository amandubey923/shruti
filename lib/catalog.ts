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
const seedTrackByPath = new Map<string, AudioTrack>();
const seedTrackById = new Map<string, AudioTrack>();
for (const t of SEED_TRACKS) {
  seedTrackById.set(t.id, t);
  seedTrackByPath.set(t.audioUrl, t);
  const rel = t.audioUrl.replace(/^https?:\/\/[^\/]+\/storage\/v1\/object\/public\/[^\/]+\//, '');
  seedTrackByPath.set(rel, t);
}

const seedSeriesById = new Map<string, Series>(
  SEED_SERIES.map((s) => [s.id, s])
);

// ── Folder→SeriesID hint map ───────────────────────────────────────────────────
const KNOWN_FOLDER_TO_SERIES_ID: Record<string, string> = {
  'krishna-smriti':            'krishna-smriti',
  'OSHO-Adhyatam_Upanishad':   'adhyatam-upanishad',
  'OSHO-Asambhav_Kranti':      'asambhav-kranti',
  'OSHO-Bhaj Govindam':        'bhaj-govindam',
  'OSHO-Bhaj_Govindam':        'bhaj-govindam',
  'OSHO-Ek_Omkar_Satnam':      'ek-omkar-satnam',
  'OSHO-Ishavashya_Upanishad': 'ishavashya-upanishad',
  'OSHO-Kaivalya_Upanishad':   'kaivalya-upanishad',
  'OSHO-Mahaveer_Vani':        'mahaveer-vani',
  'OSHO-Mare_He_Jogi_Maro':    'mare-he-jogi-maro',
  'OSHO-Nirvan_Upanishad':     'nirvan-upanishad',
  'OSHO-Sarvasar_Upanishad':   'sarvasar-upanishad',
  'OSHO-Saravsar_Upanishad':   'sarvasar-upanishad',
  'OSHO-Sarvsar_Upanishad':    'sarvasar-upanishad',
  'OSHO_ashtavakra-geeta':     'ashtavakra-geeta',
  'OSHO-ashtavakra_mahageeta': 'ashtavakra-geeta',
  'OSHO-ashtavakra-mahageeta': 'ashtavakra-geeta',
  'OSHO-Ashtavakra_Geeta':     'ashtavakra-geeta',
  'OSHO-Maha_Geeta':           'ashtavakra-geeta',
  'OSHO-Mahageeta':            'ashtavakra-geeta',
  'ashtavakra-geeta':          'ashtavakra-geeta',
  'ashtavakra-mahageeta':      'ashtavakra-geeta',
  'mahageeta':                 'ashtavakra-geeta',
  'maha-geeta':                'ashtavakra-geeta',
};

function folderNameToSeriesId(folderName: string): string {
  const clean = folderName
    .replace(/^OSHO[-_]?/i, '')
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

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
  return clean;
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

// ── Candidate file prefixes generator for probing ─────────────────────────────

function getCandidateFilePrefixes(folderName: string): string[] {
  const prefixes: string[] = [`${folderName}_`];
  const lower = folderName.toLowerCase();
  if (lower.includes('ashtavakra')) {
    prefixes.push('OSHO-Maha_Geeta_', 'OSHO-ashtavakra_mahageeta_', 'OSHO_ashtavakra-geeta_');
  }
  if (lower.includes('saravsar') || lower.includes('sarvasar')) {
    prefixes.push('OSHO-Saravsar_Upanishad_', 'OSHO-Sarvasar_Upanishad_');
  }
  if (lower.includes('mare_he_jogi_maro')) {
    prefixes.push('OSHO-Mare_He_Jogi_Maro_');
  }
  if (folderName === 'krishna-smriti') {
    prefixes.push('OSHO-Krishna_Smriti_', 'krishna-smriti-');
  }
  const stripped = folderName.replace(/^OSHO[-_]/i, '');
  if (stripped !== folderName) {
    prefixes.push(`${stripped}_`);
  }
  return Array.from(new Set(prefixes));
}

// ── Per-folder MP3 lister ─────────────────────────────────────────────────────

async function listFolderMp3s(
  src: Src,
  folderPath: string
): Promise<Array<{ name: string; url: string }>> {
  const items = await listAllItemsPaginated(src, folderPath);
  if (items.length > 0) {
    return items
      .filter((f) => f.name?.toLowerCase().endsWith('.mp3'))
      .map((f) => ({
        name: f.name,
        url: getSupabaseAudioUrl(`${folderPath}/${f.name}`, src.url),
      }));
  }

  // Fallback: If storage list API returns 0 items (e.g. RLS blocks listing on public buckets),
  // probe known audio naming conventions via fast parallel HEAD requests
  const folderName = folderPath.replace(/^osho\//i, '');
  const candidatePrefixes = getCandidateFilePrefixes(folderName);
  const found: Array<{ name: string; url: string }> = [];

  let maxParts = 25;
  const lower = folderName.toLowerCase();
  if (lower.includes('ashtavakra')) maxParts = 20;
  else if (lower.includes('mahaveer')) maxParts = 35;
  else if (lower.includes('saravsar') || lower.includes('sarvasar')) maxParts = 15;
  else if (lower.includes('mare_he')) maxParts = 25;

  const probePromises: Promise<{ name: string; url: string } | null>[] = [];

  for (const prefix of candidatePrefixes) {
    for (let part = 1; part <= maxParts; part++) {
      const pStr = String(part).padStart(2, '0');
      const filename = `${prefix}${pStr}.mp3`;
      const fullUrl = getSupabaseAudioUrl(`${folderPath}/${filename}`, src.url);

      probePromises.push(
        fetch(fullUrl, { method: 'HEAD' })
          .then((res) => (res.status === 200 ? { name: filename, url: fullUrl } : null))
          .catch(() => null)
      );
    }
  }

  const results = await Promise.all(probePromises);
  for (const r of results) {
    if (r && !found.some((f) => f.name === r.name)) {
      found.push(r);
    }
  }

  return found;
}

// ── Track builder ─────────────────────────────────────────────────────────────

const KNOWN_TRACK_DURATIONS: Record<string, number> = {
  // Osho - Adhyatam Upanishad (17 parts)
  'adhyatam-upanishad-01': 5299, 'adhyatam-upanishad-02': 4431, 'adhyatam-upanishad-03': 5194,
  'adhyatam-upanishad-04': 4554, 'adhyatam-upanishad-05': 4572, 'adhyatam-upanishad-06': 4559,
  'adhyatam-upanishad-07': 4571, 'adhyatam-upanishad-08': 5649, 'adhyatam-upanishad-09': 6236,
  'adhyatam-upanishad-10': 6073, 'adhyatam-upanishad-11': 5833, 'adhyatam-upanishad-12': 5935,
  'adhyatam-upanishad-13': 5773, 'adhyatam-upanishad-14': 4299, 'adhyatam-upanishad-15': 5602,
  'adhyatam-upanishad-16': 5716, 'adhyatam-upanishad-17': 5370,
  // Osho - Ishavashya Upanishad (13 parts)
  'ishavashya-upanishad-01': 3488, 'ishavashya-upanishad-02': 2339, 'ishavashya-upanishad-03': 3398,
  'ishavashya-upanishad-04': 3170, 'ishavashya-upanishad-05': 3268, 'ishavashya-upanishad-06': 2803,
  'ishavashya-upanishad-07': 3246, 'ishavashya-upanishad-08': 3948, 'ishavashya-upanishad-09': 2999,
  'ishavashya-upanishad-10': 2643, 'ishavashya-upanishad-11': 3225, 'ishavashya-upanishad-12': 3153,
  'ishavashya-upanishad-13': 3771,
  // Osho - Kaivalya Upanishad (15 parts)
  'kaivalya-upanishad-01': 4265, 'kaivalya-upanishad-02': 4663, 'kaivalya-upanishad-03': 5931,
  'kaivalya-upanishad-04': 3962, 'kaivalya-upanishad-05': 5592, 'kaivalya-upanishad-06': 5491,
  'kaivalya-upanishad-07': 5927, 'kaivalya-upanishad-08': 5316, 'kaivalya-upanishad-09': 5372,
  'kaivalya-upanishad-10': 5562, 'kaivalya-upanishad-11': 3702, 'kaivalya-upanishad-12': 5330,
  'kaivalya-upanishad-13': 4116, 'kaivalya-upanishad-14': 4245, 'kaivalya-upanishad-15': 2364,
  // Osho - Mahaveer Vani (35 parts)
  'mahaveer-vani-01': 5315, 'mahaveer-vani-02': 5214, 'mahaveer-vani-03': 5328, 'mahaveer-vani-04': 5410,
  'mahaveer-vani-05': 5258, 'mahaveer-vani-06': 5104, 'mahaveer-vani-07': 5352, 'mahaveer-vani-08': 5568,
  'mahaveer-vani-09': 5430, 'mahaveer-vani-10': 5292, 'mahaveer-vani-11': 5384, 'mahaveer-vani-12': 5502,
  'mahaveer-vani-13': 5340, 'mahaveer-vani-14': 5466, 'mahaveer-vani-15': 5520, 'mahaveer-vani-16': 5190,
  'mahaveer-vani-17': 5376, 'mahaveer-vani-18': 5448, 'mahaveer-vani-19': 5280, 'mahaveer-vani-20': 5310,
  'mahaveer-vani-21': 3309, 'mahaveer-vani-22': 4156, 'mahaveer-vani-23': 3979, 'mahaveer-vani-24': 3587,
  'mahaveer-vani-25': 4646, 'mahaveer-vani-26': 5686, 'mahaveer-vani-27': 3206, 'mahaveer-vani-28': 3700,
  'mahaveer-vani-29': 2903, 'mahaveer-vani-30': 3963, 'mahaveer-vani-31': 3296, 'mahaveer-vani-32': 5008,
  'mahaveer-vani-33': 4363, 'mahaveer-vani-34': 4212, 'mahaveer-vani-35': 3967,
};

function buildTrack(
  fileName: string,
  folderName: string,
  seriesId: string,
  fullUrl: string
): AudioTrack | null {
  if (!fileName.toLowerCase().endsWith('.mp3')) return null;

  const storagePath = `osho/${folderName}/${fileName}`;
  const baseName = fileName.replace(/\.mp3$/i, '');
  const partMatch = baseName.match(/[_-]?(\d+)$/);
  const partNum = partMatch ? parseInt(partMatch[1], 10) : 0;
  const partStr = partMatch ? partMatch[1].padStart(2, '0') : baseName.slice(-2);
  const trackId = `${seriesId}-${partStr}`;

  const fallbackDuration =
    KNOWN_TRACK_DURATIONS[trackId] ||
    KNOWN_TRACK_DURATIONS[baseName] ||
    0;

  // Check seedData by path or id for metadata enrichment (title, duration, etc.)
  const existing = seedTrackByPath.get(storagePath) || seedTrackById.get(trackId);
  if (existing) {
    return {
      ...existing,
      audioUrl: fullUrl,
      duration: existing.duration || fallbackDuration || 3600,
    };
  }

  // Generate metadata for tracks not in seedData
  const seed = seedSeriesById.get(seriesId);
  const seriesTitle =
    seed?.title ?? folderName.replace(/^OSHO[-_]?/i, '').replace(/[_-]/g, ' ');

  const finalDuration = fallbackDuration > 0 ? fallbackDuration : 3600;

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
    duration: finalDuration,
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
  const sumDuration = seriesTracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
  const totalDuration = sumDuration > 0 ? sumDuration : (seed?.totalDuration ?? 0);

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
    totalDuration,
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

  // 2. Target candidate folders based on source for high performance
  let candidateFolders: string[];
  if (src.index === 3) {
    candidateFolders = [
      'OSHO-ashtavakra_mahageeta',
      'OSHO-Saravsar_Upanishad',
      'OSHO-Mare_He_Jogi_Maro',
    ];
  } else if (src.index === 2) {
    candidateFolders = [
      'OSHO-Adhyatam_Upanishad',
      'OSHO-Ishavashya_Upanishad',
      'OSHO-Kaivalya_Upanishad',
      'OSHO-Mahaveer_Vani',
    ];
  } else {
    candidateFolders = Object.keys(KNOWN_FOLDER_TO_SERIES_ID);
  }

  const allFolders = new Set([...dynamicFolders, ...candidateFolders]);

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
  sourceResults.forEach((r) => {
    console.log(`[catalog] source #${r.srcIndex} folders: ${Object.keys(r.folderCounts).length}`);
    console.log(`[catalog] source #${r.srcIndex} tracks: ${r.tracks.length}`);
  });

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

  Array.from(trackMap.values()).forEach((track) => {
    const sId = track.seriesId || 'unknown';
    if (!seriesTracksMap.has(sId)) seriesTracksMap.set(sId, []);
    seriesTracksMap.get(sId)!.push(track);
  });

  // Ensure all canonical series exist in the catalog even if they have 0 tracks
  for (const seed of SEED_SERIES) {
    if (!seriesTracksMap.has(seed.id)) {
      seriesTracksMap.set(seed.id, []);
    }
  }

  // ── Step 4: Sort tracks (series then part number) ─────────────────────────
  const tracks = Array.from(trackMap.values()).sort((a, b) => {
    const sA = a.seriesId || '';
    const sB = b.seriesId || '';
    if (sA !== sB) return sA.localeCompare(sB);
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
