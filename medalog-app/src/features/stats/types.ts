/**
 * The counters the server keeps in its own `user_stats` document.
 *
 * Every screen that needs a number (library tab badges, dashboard tiles) reads
 * this shape instead of asking for the rows - the server serves it from one
 * indexed lookup, not a count over four collections.
 */
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
  /** when the server last recomputed the document (epoch ms) */
  reconciled_at: number;
}

export const EMPTY_STATS: StatsSnapshot = {
  total_movies: 0,
  total_series: 0,
  total_books: 0,
  total_stashed_tabs: 0,
  total_links: 0,
  total_cards: 0,
  total_records: 0,
  watching: 0,
  reading: 0,
  completed: 0,
  completed_this_month: 0,
  watchlist: 0,
  reconciled_at: 0,
};
