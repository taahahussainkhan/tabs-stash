/** One card in the dashboard strips (continue / completed / watchlist). */
export interface DashboardItem {
  id: string;
  title: string;
  kind: 'movie' | 'series' | 'book';
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

export interface DashboardStats {
  total_movies: number;
  total_series: number;
  total_books: number;
  total_stashed_tabs: number;
  watching: number;
  reading: number;
  completed: number;
  watchlist: number;
  completed_this_month: number;
}

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
