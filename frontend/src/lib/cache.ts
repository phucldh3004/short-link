import { LRUCache } from "lru-cache"

// Cache configuration
const cacheOptions = {
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 5, // 5 minutes TTL
  updateAgeOnGet: true,
  allowStale: true,
  maxAge: 1000 * 60 * 10 // 10 minutes max age
}

// Analytics cache
export const analyticsCache = new LRUCache<string, any>(cacheOptions)

// Shortlinks cache
export const shortlinksCache = new LRUCache<string, any>(cacheOptions)

// Cache key generators
export const cacheKeys = {
  analytics: (userId: string, period: string, shortlinkId?: string) =>
    `analytics:${userId}:${period}${shortlinkId ? `:${shortlinkId}` : ""}`,

  shortlinks: (userId: string) => `shortlinks:${userId}`,

  shortlink: (shortlinkId: string) => `shortlink:${shortlinkId}`,

  timeschedules: (shortlinkId: string) => `timeschedules:${shortlinkId}`
}

// Cache utilities
export const cacheUtils = {
  // Get cached data
  get: <T>(key: string): T | undefined => {
    return analyticsCache.get(key) || shortlinksCache.get(key)
  },

  // Set cached data
  set: (key: string, data: any, ttl?: number): void => {
    if (key.startsWith("analytics:")) {
      analyticsCache.set(key, data, { ttl })
    } else {
      shortlinksCache.set(key, data, { ttl })
    }
  },

  // Delete cached data
  delete: (key: string): void => {
    analyticsCache.delete(key)
    shortlinksCache.delete(key)
  },

  // Clear all cache
  clear: (): void => {
    analyticsCache.clear()
    shortlinksCache.clear()
  },

  // Invalidate cache by pattern
  invalidateByPattern: (pattern: string): void => {
    const regex = new RegExp(pattern)

    for (const key of analyticsCache.keys()) {
      if (regex.test(key)) {
        analyticsCache.delete(key)
      }
    }

    for (const key of shortlinksCache.keys()) {
      if (regex.test(key)) {
        shortlinksCache.delete(key)
      }
    }
  },

  // Get cache stats
  getStats: () => ({
    analytics: {
      size: analyticsCache.size,
      max: analyticsCache.max,
      ttl: analyticsCache.ttl
    },
    shortlinks: {
      size: shortlinksCache.size,
      max: shortlinksCache.max,
      ttl: shortlinksCache.ttl
    }
  })
}

// Cache middleware for API routes
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    const cached = cacheUtils.get<R>(key)

    if (cached) {
      return cached
    }

    const result = await fn(...args)
    cacheUtils.set(key, result, ttl)
    return result
  }
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate analytics cache for user
  invalidateUserAnalytics: (userId: string) => {
    cacheUtils.invalidateByPattern(`analytics:${userId}:.*`)
  },

  // Invalidate shortlinks cache for user
  invalidateUserShortlinks: (userId: string) => {
    cacheUtils.invalidateByPattern(`shortlinks:${userId}`)
  },

  // Invalidate specific shortlink cache
  invalidateShortlink: (shortlinkId: string) => {
    cacheUtils.delete(cacheKeys.shortlink(shortlinkId))
    cacheUtils.delete(cacheKeys.timeschedules(shortlinkId))
  },

  // Invalidate all caches (for admin purposes)
  invalidateAll: () => {
    cacheUtils.clear()
  }
}
