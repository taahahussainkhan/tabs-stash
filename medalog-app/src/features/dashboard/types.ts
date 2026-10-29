/** One card in the dashboard strips (continue / completed / watchlist). */
import type { StatsSnapshot } from '../stats';

export interface DashboardItem {
  id: string;
  title: string;
  kind: 'movie' | 'series' | 'book';
  posterUrl?: string | null;
  authorOrDirector?: string | null;
  year?: number | null;
  genre?: string | null;
  status: string;
  rating?: number | null;
  isFavorite?: boolean;
  isWatchlist?: boolean;
  updatedAt?: string | null;
  endDate?: string | null;
}

/** The dashboard shows the same counters as every other screen. */
export type DashboardStats = StatsSnapshot;

export interface DashboardData {
  stats: DashboardStats;
  continue_watching: DashboardItem[];
  recently_completed: DashboardItem[];
  watchlist_preview: DashboardItem[];
}

export const KIND_GLYPH: Record<DashboardItem['kind'], string> = {
  movie: '▶',
  series: '❐',
  book: '▥',
};

/** Accent per media kind, shared by dashboard tiles and empty posters. */
export const KIND_TINT: Record<DashboardItem['kind'], string> = {
  movie: '#7c5cff',
  series: '#2fb8a6',
  book: '#e0803a',
};
