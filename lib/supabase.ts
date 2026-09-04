import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const AUDIO_BUCKET = 'audio';

function resolveCredentials(
  urlEnv: string | undefined,
  keyEnv: string | undefined,
  keyEnv2?: string | undefined
): { url: string; publishableKey: string; isConfigured: boolean } {
  const envUrl = (urlEnv || '').trim().replace(/^['"]|['"]$/g, '');
  const envKey = (keyEnv || keyEnv2 || '').trim().replace(/^['"=]|['"]$/g, '');

  let url = envUrl;
  let publishableKey = envKey;

  // Auto-detection: if user accidentally swapped URL and Key in .env
  if (
    url.startsWith('sb_publishable_') ||
    url.startsWith('sbp_') ||
    url.startsWith('eyJ')
  ) {
    if (publishableKey.includes('.supabase.co') || publishableKey.startsWith('http')) {
      const temp = url;
      url = publishableKey;
      publishableKey = temp;
    } else {
      publishableKey = url;
      url = '';
    }
  }

  // Ensure url has https:// prefix if domain provided
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.includes('.supabase.co')) {
      url = `https://${url}`;
    } else if (/^[a-z0-9_-]+$/i.test(url)) {
      url = `https://${url}.supabase.co`;
    }
  }

  const isConfigured = Boolean(
    url &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    publishableKey &&
    !publishableKey.startsWith('sb_secret') // Safety check: never treat secret key as publishable
  );

  return { url, publishableKey, isConfigured };
}

// ── Primary Supabase ──────────────────────────────────────────────────────────
const cred1 = resolveCredentials(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const isSupabaseConfigured = cred1.isConfigured;
export const supabaseUrl = cred1.url;

export const supabase: SupabaseClient = createClient(
  cred1.url || 'https://placeholder.supabase.co',
  cred1.publishableKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true } }
);

// ── Secondary Supabase ────────────────────────────────────────────────────────
const cred2 = resolveCredentials(
  process.env.NEXT_PUBLIC_SUPABASE_2_URL,
  process.env.NEXT_PUBLIC_SUPABASE_2_PUBLISHABLE_KEY
);

export const isSupabase2Configured = cred2.isConfigured;
export const supabaseUrl2 = cred2.url;

export const supabase2: SupabaseClient = createClient(
  cred2.url || 'https://placeholder2.supabase.co',
  cred2.publishableKey || 'placeholder-anon-key-2',
  { auth: { persistSession: false, autoRefreshToken: false } }
);

// ── All configured sources (extensible — add supabase3 etc. here later) ──────
export const supabaseSources: Array<{
  client: SupabaseClient;
  url: string;
  publishableKey: string;
  isConfigured: boolean;
  index: number;
}> = [
  { client: supabase,  url: cred1.url, publishableKey: cred1.publishableKey, isConfigured: cred1.isConfigured, index: 1 },
  { client: supabase2, url: cred2.url, publishableKey: cred2.publishableKey, isConfigured: cred2.isConfigured, index: 2 },
];

/**
 * Generate a public streaming URL for an audio file in a specific Supabase project.
 * @param pathOrUrl - relative path like 'osho/series/file.mp3', or a full URL (returned as-is)
 * @param projectUrl - base URL of the Supabase project (defaults to primary)
 * @param bucket - storage bucket name
 */
export function getSupabaseAudioUrl(
  pathOrUrl: string,
  projectUrl: string = supabaseUrl,
  bucket: string = AUDIO_BUCKET
): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const cleanPath = pathOrUrl.replace(/^\/+/, '');
  if (projectUrl) {
    const base = projectUrl.replace(/\/+$/, '');
    return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }
  return cleanPath;
}

/** Convenience: primary Supabase audio URL */
export function getSupabaseAudioUrl1(pathOrUrl: string, bucket = AUDIO_BUCKET): string {
  return getSupabaseAudioUrl(pathOrUrl, supabaseUrl, bucket);
}

/** Convenience: secondary Supabase audio URL */
export function getSupabaseAudioUrl2(pathOrUrl: string, bucket = AUDIO_BUCKET): string {
  return getSupabaseAudioUrl(pathOrUrl, supabaseUrl2, bucket);
}

/**
 * List audio files in a Supabase storage folder.
 */
export async function listSupabaseAudioFiles(
  folderPath: string,
  client: SupabaseClient = supabase,
  bucket: string = AUDIO_BUCKET
) {
  try {
    const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
    const { data, error } = await client.storage.from(bucket).list(cleanFolder, {
      limit: 200,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.warn(`Storage list error [${folderPath}]:`, error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase storage list exception:', err);
    return [];
  }
}
