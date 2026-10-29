import { Types } from 'mongoose';
import { MovieModel } from '../models/movie.model';
import { SeriesModel } from '../models/series.model';
import { BookItemModel } from '../models/book.model';
import { StashedSessionModel } from '../models/session.model';
import { SavedLinkModel } from '../models/link.model';
import { CardModel } from '../models/card.model';
import { QuickRecordModel } from '../models/quick-record.model';
import { MediaSessionModel } from '../models/media-session.model';
import { UserStatsModel, IUserStats } from '../models/user-stats.model';
import { CacheService } from './cache.service';

/**
 * The only place that knows how to count a user's library.
 *
 * `read()` is what every endpoint serves: one indexed lookup on a small
 * document. `reconcile()` rebuilds that document from the collections, and runs
 * only when the document is missing, explicitly invalidated, or older than
 * STATS_TTL_MS - so a missed invalidation costs correctness for at most one TTL
 * instead of forever.
 */
export const STATS_TTL_MS = 10 * 60 * 1000;

export interface StatsSnapshot {
  total_movies: number;
  total_series: number;
  total_books: number;
  total_stashed_tabs: number;
  total_links: number;
  total_cards: number;
  total_records: number;
  watching: number;
  reading: number;
  completed: number;
  completed_this_month: number;
  watchlist: number;
  /** epoch ms; the client can use it to decide how much to trust the numbers */
  reconciled_at: number;
}

function monthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function countAll(userId: Types.ObjectId): Promise<Omit<IUserStats, 'userId' | 'reconciledAt'>> {
  const [
    movies,
    series,
    books,
    stashedSessions,
    links,
    cards,
    records,
    watchlistMovies,
    watchlistSeries,
    wishlistBooks,
    activity,
  ] = await Promise.all([
    MovieModel.countDocuments({ userId }),
    SeriesModel.countDocuments({ userId }),
    BookItemModel.countDocuments({ userId }),
    StashedSessionModel.countDocuments({ userId, deletedAt: null }),
    SavedLinkModel.countDocuments({ userId, deletedAt: null }),
    CardModel.countDocuments({ userId, deletedAt: null }),
    QuickRecordModel.countDocuments({ userId, status: 'active' }),
    MovieModel.countDocuments({ userId, isWatchlist: true }),
    SeriesModel.countDocuments({ userId, isWatchlist: true }),
    BookItemModel.countDocuments({ userId, ownershipStatus: 'Wishlist' }),
    MediaSessionModel.aggregate([
      { $match: { userId } },
      {
        $facet: {
          watching: [
            { $match: { mediaType: { $in: ['movie', 'series'] }, status: 'watching' } },
            { $count: 'count' },
          ],
          reading: [{ $match: { mediaType: 'book', status: 'reading' } }, { $count: 'count' }],
          completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
          completedThisMonth: [
            { $match: { status: 'completed', endDate: { $gte: monthStart() } } },
            { $count: 'count' },
          ],
        },
      },
    ]),
  ]);

  const facet = activity[0] || {};
  return {
    movies,
    series,
    books,
    stashedSessions,
    links,
    cards,
    records,
    watching: facet.watching?.[0]?.count || 0,
    reading: facet.reading?.[0]?.count || 0,
    completed: facet.completed?.[0]?.count || 0,
    completedThisMonth: facet.completedThisMonth?.[0]?.count || 0,
    watchlist: watchlistMovies + watchlistSeries + wishlistBooks,
  };
}

function toSnapshot(doc: Partial<IUserStats>): StatsSnapshot {
  return {
    total_movies: doc.movies ?? 0,
    total_series: doc.series ?? 0,
    total_books: doc.books ?? 0,
    total_stashed_tabs: doc.stashedSessions ?? 0,
    total_links: doc.links ?? 0,
    total_cards: doc.cards ?? 0,
    total_records: doc.records ?? 0,
    watching: doc.watching ?? 0,
    reading: doc.reading ?? 0,
    completed: doc.completed ?? 0,
    completed_this_month: doc.completedThisMonth ?? 0,
    watchlist: doc.watchlist ?? 0,
    reconciled_at: doc.reconciledAt ?? 0,
  };
}

export class StatsService {
  /** Rebuild the document from the collections. Idempotent, safe to race. */
  static async reconcile(userId: string): Promise<StatsSnapshot> {
    const uId = new Types.ObjectId(userId);
    const counts = await countAll(uId);
    const reconciledAt = Date.now();
    const doc = await UserStatsModel.findOneAndUpdate(
      { userId: uId },
      { $set: { ...counts, reconciledAt } },
      { upsert: true, new: true }
    ).lean();
    return toSnapshot(doc ?? { ...counts, reconciledAt });
  }

  /** The hot path: one lookup, recompute only when stale or missing. */
  static async read(userId: string): Promise<StatsSnapshot> {
    const doc = await UserStatsModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
    if (doc && Date.now() - doc.reconciledAt < STATS_TTL_MS) {
      return toSnapshot(doc);
    }
    return this.reconcile(userId);
  }

  /**
   * Mark the counters stale. Called for every successful write, so the next
   * read recomputes instead of serving numbers that no longer match reality.
   */
  static async invalidate(userId: string): Promise<void> {
    CacheService.invalidateDashboard(userId);
    try {
      await UserStatsModel.updateOne(
        { userId: new Types.ObjectId(userId) },
        { $set: { reconciledAt: 0 } }
      );
    } catch {
      // a failed invalidation must never fail the user's write; the TTL heals it
    }
  }
}
