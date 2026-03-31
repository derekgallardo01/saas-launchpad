/**
 * In-memory token-bucket rate limiter.
 *
 * Designed for single-instance deployments and serverless (Vercel) where
 * a Redis dependency is overkill. For multi-instance production deployments,
 * swap the `Map` store for Redis (e.g., `@upstash/ratelimit`).
 *
 * @example
 * ```ts
 * const limiter = createRateLimit({ limit: 60, windowMs: 60_000 });
 *
 * // In a tRPC middleware or API route:
 * const result = limiter.check(userId);
 * if (!result.allowed) {
 *   return new Response("Too Many Requests", {
 *     status: 429,
 *     headers: result.headers,
 *   });
 * }
 * ```
 */

import { log } from "@/lib/logger";

interface RateLimitConfig {
  /** Maximum number of tokens (requests) per window. */
  limit: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
  headers: Record<string, string>;
}

interface RateLimiter {
  /** Check whether a request from `identifier` should be allowed. */
  check: (identifier: string) => RateLimitResult;
  /** Reset the bucket for a specific identifier (useful for testing). */
  reset: (identifier: string) => void;
}

export function createRateLimit(config: RateLimitConfig): RateLimiter {
  const { limit, windowMs } = config;
  const buckets = new Map<string, TokenBucket>();

  // Periodically prune expired buckets to prevent unbounded memory growth.
  // Runs every 5 minutes.
  const PRUNE_INTERVAL = 5 * 60 * 1000;
  let lastPrune = Date.now();

  function prune(now: number): void {
    if (now - lastPrune < PRUNE_INTERVAL) return;
    lastPrune = now;

    for (const [key, bucket] of buckets) {
      const elapsed = now - bucket.lastRefill;
      if (elapsed > windowMs * 2) {
        buckets.delete(key);
      }
    }
  }

  function check(identifier: string): RateLimitResult {
    const now = Date.now();
    prune(now);

    let bucket = buckets.get(identifier);

    if (!bucket) {
      bucket = { tokens: limit, lastRefill: now };
      buckets.set(identifier, bucket);
    }

    // Refill tokens proportionally to elapsed time (smooth refill).
    const elapsed = now - bucket.lastRefill;
    const refillAmount = (elapsed / windowMs) * limit;
    bucket.tokens = Math.min(limit, bucket.tokens + refillAmount);
    bucket.lastRefill = now;

    const allowed = bucket.tokens >= 1;

    if (allowed) {
      bucket.tokens -= 1;
    } else {
      log.warn("Rate limit exceeded", { identifier, limit, windowMs });
    }

    const remaining = Math.max(0, Math.floor(bucket.tokens));
    // Time until one full token is refilled.
    const resetMs = allowed
      ? now + windowMs
      : now + Math.ceil(((1 - bucket.tokens) / limit) * windowMs);

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
    };

    return { allowed, limit, remaining, resetMs, headers };
  }

  function reset(identifier: string): void {
    buckets.delete(identifier);
  }

  return { check, reset };
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for common use cases
// ---------------------------------------------------------------------------

/** General API rate limit: 100 requests per minute. */
export const apiRateLimit = createRateLimit({ limit: 100, windowMs: 60_000 });

/** Auth rate limit: 10 attempts per 15 minutes. */
export const authRateLimit = createRateLimit({ limit: 10, windowMs: 15 * 60_000 });

/** Strict rate limit for sensitive operations: 5 per minute. */
export const strictRateLimit = createRateLimit({ limit: 5, windowMs: 60_000 });
