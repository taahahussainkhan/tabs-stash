interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Enterprise-grade in-memory TTL cache service.
 * Eliminates redundant database roundtrips for hot, read-heavy data
 * (such as token versions and dashboard summaries).
 */
export class CacheService {
  private static tokenVersionCache = new Map<string, CacheEntry<number>>();
  private static dashboardCache = new Map<string, CacheEntry<any>>();
  private static generalCache = new Map<string, CacheEntry<any>>();

  // Default TTL configurations (in milliseconds)
  private static readonly TOKEN_TTL_MS = 60 * 1000; // 60 seconds
  private static readonly DASHBOARD_TTL_MS = 15 * 1000; // 15 seconds

  /**
   * Generic get for arbitrary cached values.
   */
  static get<T>(key: string): T | null {
    const entry = this.generalCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.generalCache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Generic set with custom TTL in seconds.
   */
  static set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    this.generalCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Get cached user token version if valid and not expired.
   */
  static getTokenVersion(userId: string): number | null {
    const entry = this.tokenVersionCache.get(userId);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.tokenVersionCache.delete(userId);
      return null;
    }

    return entry.value;
  }

  /**
   * Cache user token version with sliding TTL.
   */
  static setTokenVersion(userId: string, version: number): void {
    this.tokenVersionCache.set(userId, {
      value: version,
      expiresAt: Date.now() + this.TOKEN_TTL_MS,
    });
  }

  /**
   * Get cached dashboard payload for a user.
   */
  static getDashboard(userId: string): any | null {
    const entry = this.dashboardCache.get(userId);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.dashboardCache.delete(userId);
      return null;
    }

    return entry.value;
  }

  /**
   * Cache dashboard payload for a user.
   */
  static setDashboard(userId: string, data: any): void {
    this.dashboardCache.set(userId, {
      value: data,
      expiresAt: Date.now() + this.DASHBOARD_TTL_MS,
    });
  }

  /**
   * Invalidate all cached data for a specific user (on logout, token revocation, or media mutation).
   */
  static invalidateUser(userId: string): void {
    this.tokenVersionCache.delete(userId);
    this.dashboardCache.delete(userId);
  }

  /**
   * Invalidate only dashboard cache for a user (e.g. when logging new media or updating progress).
   */
  static invalidateDashboard(userId: string): void {
    this.dashboardCache.delete(userId);
  }

  /**
   * Periodic cleanup to prevent unbounded memory growth in long-running processes.
   */
  static pruneExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.tokenVersionCache.entries()) {
      if (now > entry.expiresAt) this.tokenVersionCache.delete(key);
    }
    for (const [key, entry] of this.dashboardCache.entries()) {
      if (now > entry.expiresAt) this.dashboardCache.delete(key);
    }
    for (const [key, entry] of this.generalCache.entries()) {
      if (now > entry.expiresAt) this.generalCache.delete(key);
    }
  }
}

// Run pruning every 5 minutes
if (typeof setInterval !== 'undefined') {
  const pruner = setInterval(() => CacheService.pruneExpired(), 5 * 60 * 1000);
  if (pruner.unref) pruner.unref(); // Allow Node process to exit gracefully
}
