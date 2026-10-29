import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Keeps `user_stats` in sync without touching a single controller.
 *
 * Any successful mutating request from an authenticated user marks that user's
 * counters stale; the next read recomputes them. Doing this once at the edge
 * means a new feature cannot forget to update the counters - and it costs one
 * small indexed update, after the response has already been sent.
 */
export function invalidateStatsOnWrite(req: Request, res: Response, next: NextFunction): void {
  if (MUTATING.has(req.method)) {
    res.on('finish', () => {
      const userId = req.user?.userId;
      if (userId && res.statusCode >= 200 && res.statusCode < 400) {
        void StatsService.invalidate(userId);
      }
    });
  }
  next();
}
