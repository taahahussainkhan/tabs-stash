import { api } from '../../core/http';
import type { DashboardData, DashboardItem, DashboardStats } from './types';

type AnyRecord = Record<string, any>;

function toItem(raw: AnyRecord): DashboardItem {
  const kind = (raw.type ?? raw.media_type ?? 'movie') as DashboardItem['kind'];
  return {
    id: String(raw.public_id ?? raw.publicId ?? raw.id ?? ''),
    title: raw.title ?? 'Untitled',
    kind,
    posterUrl: raw.poster_url ?? raw.posterUrl ?? raw.poster_image ?? null,
    authorOrDirector: raw.author_or_director ?? raw.authorOrDirector ?? null,
    year: raw.year ?? null,
    genre: raw.genre ?? null,
    status: raw.status ?? '',
    rating: raw.rating ?? null,
    isFavorite: raw.is_favorite ?? raw.isFavorite ?? false,
    isWatchlist: raw.is_watchlist ?? raw.isWatchlist ?? false,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
    endDate: raw.end_date ?? raw.endDate ?? null,
  };
}

function toItems(raw: unknown): DashboardItem[] {
  return Array.isArray(raw) ? raw.map(item => toItem(item as AnyRecord)) : [];
}

function toStats(raw: AnyRecord | undefined): DashboardStats {
  return {
    total_movies: raw?.total_movies ?? 0,
    total_series: raw?.total_series ?? 0,
    total_books: raw?.total_books ?? 0,
    total_stashed_tabs: raw?.total_stashed_tabs ?? 0,
    total_links: raw?.total_links ?? 0,
    total_cards: raw?.total_cards ?? 0,
    total_records: raw?.total_records ?? 0,
    watching: raw?.watching ?? 0,
    reading: raw?.reading ?? 0,
    completed: raw?.completed ?? 0,
    completed_this_month: raw?.completed_this_month ?? 0,
    watchlist: raw?.watchlist ?? 0,
    reconciled_at: raw?.reconciled_at ?? 0,
  };
}

export const dashboardApi = {
  /** One request: counters + the three feeds the home screen shows. */
  overview: async (): Promise<DashboardData> => {
    const raw = await api.get<AnyRecord>('/dashboard');
    return {
      stats: toStats(raw?.stats),
      continue_watching: toItems(raw?.continue_watching),
      recently_completed: toItems(raw?.recently_completed),
      watchlist_preview: toItems(raw?.watchlist_preview),
    };
  },
};
