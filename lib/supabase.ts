import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const AUDIO_BUCKET = 'audio';

function resolveSupabaseCredentials(): { url: string; publishableKey: string; isConfigured: boolean } {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '');
  const envKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim().replace(/^['"=]|['"]$/g, '');

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

const { url: finalUrl, publishableKey: finalKey, isConfigured: configuredState } = resolveSupabaseCredentials();

export const isSupabaseConfigured = configuredState;
export const supabaseUrl = finalUrl;

// Supabase client singleton using public publishable / anon credentials
export const supabase: SupabaseClient = createClient(
  finalUrl || 'https://placeholder.supabase.co',
  finalKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Generate the public streaming URL for an audio file located in Supabase Storage.
 *
 * Examples:
 * - 'osho/krishna-smriti/OSHO-Krishna_Smriti_01.mp3' -> 'https://<project-ref>.supabase.co/storage/v1/object/public/audio/osho/krishna-smriti/OSHO-Krishna_Smriti_01.mp3'
 * - 'https://cdn.example.com/audio.mp3' -> returns as-is
 */
export function getSupabaseAudioUrl(pathOrUrl: string, bucket: string = AUDIO_BUCKET): string {
  if (!pathOrUrl) return '';

  // If already a full HTTP/HTTPS URL, return directly
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  const cleanPath = pathOrUrl.replace(/^\/+/, '');

  if (isSupabaseConfigured && finalUrl) {
    const baseUrl = finalUrl.replace(/\/+$/, '');
    return `${baseUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
  }

  // Fallback if Supabase URL is not configured yet
  return cleanPath;
}

/**
 * List audio files in a specific Supabase storage folder (e.g. 'osho/krishna-smriti')
 */
export async function listSupabaseAudioFiles(folderPath: string, bucket: string = AUDIO_BUCKET) {
  if (!isSupabaseConfigured) {
    return [];
  }
  try {
    const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
    const { data, error } = await supabase.storage.from(bucket).list(cleanFolder, {
      limit: 100,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) {
      console.warn('Error listing Supabase audio files:', error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase storage list exception:', err);
    return [];
  }
}

