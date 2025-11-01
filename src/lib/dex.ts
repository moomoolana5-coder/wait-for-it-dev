// Centralized Dexscreener fetch with simple rate limit, retries and in-memory cache
// This helps avoid 429 and CORS-like errors from too many parallel requests

const MAX_CONCURRENCY = 2;
const MIN_DELAY_MS = 300; // spacing between outbound requests
const RETRIES = 2;
const CACHE_TTL_MS = 60_000;

let active = 0;
const queue: Array<() => void> = [];
let lastDispatchedAt = 0;

// Simple in-memory cache
const cache = new Map<string, { ts: number; json: any }>();

const schedule = async <T>(fn: () => Promise<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const run = async () => {
      active++;
      try {
        const now = Date.now();
        const waitFor = Math.max(0, MIN_DELAY_MS - (now - lastDispatchedAt));
        if (waitFor > 0) await new Promise((r) => setTimeout(r, waitFor));
        lastDispatchedAt = Date.now();
        const result = await fn();
        resolve(result);
      } catch (e) {
        reject(e);
      } finally {
        active--;
        const next = queue.shift();
        if (next) next();
      }
    };

    if (active < MAX_CONCURRENCY) run();
    else queue.push(run);
  });
};

export const dexFetch = async (url: string, init?: RequestInit): Promise<Response> => {
  // Cache check
  const cacheEntry = cache.get(url);
  const now = Date.now();
  if (cacheEntry && now - cacheEntry.ts < CACHE_TTL_MS) {
    // Rehydrate a Response from cached JSON
    return new Response(JSON.stringify(cacheEntry.json), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const attempt = async (n: number): Promise<Response> => {
    const res = await fetch(url, init);
    // If 429/5xx, retry with backoff
    if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
      if (n < RETRIES) {
        const backoff = (n + 1) * 600; // 600ms, 1200ms
        await new Promise((r) => setTimeout(r, backoff));
        return attempt(n + 1);
      }
    }
    // Cache successful JSON responses
    try {
      if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const json = await res.clone().json();
        cache.set(url, { ts: Date.now(), json });
      }
    } catch {
      // ignore cache errors
    }
    return res;
  };

  return schedule(() => attempt(0));
};
