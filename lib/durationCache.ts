/**
 * SHRUTI — Lazy Audio Duration Loader
 *
 * Loads real MP3 durations from HTML5 Audio metadata (preload="metadata").
 * - Only fetches audio headers, NOT the full file body.
 * - Results are cached by URL for the session (never re-fetched).
 * - Maximum 3 simultaneous Audio elements at once (concurrency limiter).
 * - NaN / Infinity values are discarded (returns 0).
 * - Subscribers are notified when a duration resolves.
 */

/** Global duration cache: url → seconds */
const resolved = new Map<string, number>();

/** In-flight deduplication: url → shared Promise<duration> */
const inFlight = new Map<string, Promise<number>>();

/** Subscribers: url → Set of callbacks called when duration resolves */
const subscribers = new Map<string, Set<(dur: number) => void>>();

/** Concurrency limiter: at most MAX_CONCURRENT Audio elements loading at once */
const MAX_CONCURRENT = 3;
let active = 0;
const waitQueue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => waitQueue.push(resolve));
}

function releaseSlot(): void {
  const next = waitQueue.shift();
  if (next) {
    next();
  } else {
    active--;
  }
}

/**
 * Load real audio duration for a URL using HTML5 Audio preload="metadata".
 * Returns 0 if duration cannot be determined (error, NaN, Infinity).
 * Cached per URL — the same URL is never loaded twice.
 */
export function loadDuration(url: string): Promise<number> {
  if (!url || typeof window === 'undefined') return Promise.resolve(0);

  // Already resolved
  const cached = resolved.get(url);
  if (cached !== undefined) return Promise.resolve(cached);

  // Already in flight — share the same promise
  const existing = inFlight.get(url);
  if (existing) return existing;

  const promise = acquireSlot().then(
    () =>
      new Promise<number>((resolve) => {
        const audio = new Audio();
        audio.preload = 'metadata';

        const finish = (dur: number) => {
          audio.src = '';
          releaseSlot();
          const safe = isFinite(dur) && !isNaN(dur) && dur > 0 ? Math.round(dur) : 0;
          resolved.set(url, safe);
          inFlight.delete(url);
          subscribers.get(url)?.forEach((cb) => cb(safe));
          subscribers.delete(url);
          resolve(safe);
        };

        audio.addEventListener('loadedmetadata', () => finish(audio.duration), { once: true });
        audio.addEventListener('error', () => finish(0), { once: true });
        audio.addEventListener('abort', () => finish(0), { once: true });

        audio.src = url;
      })
  );

  inFlight.set(url, promise);
  return promise;
}

/**
 * Subscribe to be notified when a URL's duration resolves.
 * If already resolved, fires the callback immediately.
 * Returns an unsubscribe function.
 */
export function subscribeDuration(url: string, cb: (dur: number) => void): () => void {
  const cached = resolved.get(url);
  if (cached !== undefined) {
    Promise.resolve().then(() => cb(cached));
    return () => {};
  }

  if (!subscribers.has(url)) subscribers.set(url, new Set());
  subscribers.get(url)!.add(cb);

  return () => {
    subscribers.get(url)?.delete(cb);
  };
}

/**
 * Get the cached duration for a URL synchronously.
 * Returns undefined if not yet resolved.
 */
export function getCachedDuration(url: string): number | undefined {
  return resolved.get(url);
}

/**
 * Pre-warm duration cache for a batch of URLs.
 */
export function preloadDurations(urls: string[]): void {
  for (const url of urls) {
    if (url && !resolved.has(url) && !inFlight.has(url)) {
      loadDuration(url);
    }
  }
}

