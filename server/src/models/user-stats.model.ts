import { Schema, model, Document, Types } from 'mongoose';

/**
 * Denormalised per-user counters.
 *
 * Reads that only need numbers (library tab badges, dashboard tiles) must never
 * run `countDocuments` over four collections - this document is filled once and
 * then served straight from a single indexed lookup.
 *
 * It is a *cache of a query*, never the source of truth: every mutating request
 * marks it stale (see stats-invalidation.middleware) and `reconciledAt` lets a
 * document that was never invalidated self-heal after `STATS_TTL_MS`.
 */
export interface IUserStats {
  userId: Types.ObjectId | string;

  /** library totals */
  movies: number;
  series: number;
  books: number;

  /** everything else the app surfaces as a count */
  stashedSessions: number;
  links: number;
  cards: number;
  records: number;

  /** activity, derived from media sessions */
  watching: number;
  reading: number;
  completed: number;
  completedThisMonth: number;
  watchlist: number;

  /** epoch ms of the last full recomputation; 0 = stale */
  reconciledAt: number;
}

export interface IUserStatsDocument extends IUserStats, Document {}

const UserStatsSchema = new Schema<IUserStatsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true },
    movies: { type: Number, default: 0 },
    series: { type: Number, default: 0 },
    books: { type: Number, default: 0 },
    stashedSessions: { type: Number, default: 0 },
    links: { type: Number, default: 0 },
    cards: { type: Number, default: 0 },
    records: { type: Number, default: 0 },
    watching: { type: Number, default: 0 },
    reading: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    completedThisMonth: { type: Number, default: 0 },
    watchlist: { type: Number, default: 0 },
    reconciledAt: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export const UserStatsModel = model<IUserStatsDocument>('UserStats', UserStatsSchema);
