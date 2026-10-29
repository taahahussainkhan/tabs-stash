import { api } from '../../core/http';
import type {
  BookDetail,
  BookItem,
  MediaDetail,
  MediaItem,
  MediaKind,
  MediaSession,
  Page,
  SeasonSummary,
  WatchStatus,
} from './types';

type AnyRecord = Record<string, any>;

const PAGE_SIZE = 20;

/* --------------------------------------------------------------- mapping */

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toSeasons(seasons: unknown): SeasonSummary[] | undefined {
  if (!Array.isArray(seasons) || !seasons.length) return undefined;
  return seasons.map((season: AnyRecord, index) => ({
    seasonNumber: season.season_number ?? season.seasonNumber ?? index + 1,
    episodeCount: season.episode_count ?? season.episodeCount ?? season.episodes?.length ?? 0,
    title: str(season.title),
    year: num(season.year),
  }));
}

/** Movie and series payloads differ only in which field names the creator. */
function toMedia(raw: AnyRecord, kind: MediaKind): MediaItem {
  const entity: AnyRecord = raw.movie ?? raw.series ?? raw;
  const session: AnyRecord | null = raw.current_session ?? null;
  const episodes: AnyRecord[] = Array.isArray(entity.seasons)
    ? entity.seasons.flatMap((s: AnyRecord) => (Array.isArray(s.episodes) ? s.episodes : []))
    : [];
  const totalEpisodes =
    num(entity.total_episodes) ?? num(raw.total_episodes) ?? (episodes.length || undefined);
  const watched =
    num(entity.episodes_watched) ??
    num(raw.episodes_watched) ??
    episodes.filter(e => e.is_watched || e.isWatched).length;

  const id = entity.public_id ?? entity.publicId ?? entity.id ?? raw.public_id ?? '';

  return {
    id: String(id),
    kind,
    title: str(entity.title) ?? str(raw.title) ?? 'Untitled',
    creator: str(entity.director) ?? str(entity.creator) ?? undefined,
    year: num(entity.year),
    genre: str(entity.genre),
    poster: str(entity.poster_image) ?? str(entity.posterImage),
    platform: str(entity.platform),
    rating: num(session?.rating),
    notes: str(session?.notes),
    status: ((session?.status ?? entity.status ?? 'to_watch') as WatchStatus),
    startedAt: str(session?.start_date) ?? str(session?.startDate) ?? str(entity.created_at),
    endedAt: str(session?.end_date) ?? str(session?.endDate) ?? null,
    isFavorite: Boolean(entity.is_favorite ?? entity.isFavorite),
    isWatchlist: Boolean(entity.is_watchlist ?? entity.isWatchlist),
    rewatchCount: num(raw.rewatch_count) ?? 0,
    totalEpisodes,
    episodesWatched: watched || undefined,
    seasons: toSeasons(entity.seasons),
  };
}

function toBook(raw: AnyRecord): BookItem {
  const edition: AnyRecord = raw.edition ?? {};
  const book: AnyRecord = edition.book ?? raw.book ?? {};

  return {
    id: num(raw.id) ?? 0,
    publicId: String(raw.public_id ?? raw.publicId ?? raw.id ?? ''),
    title: str(book.title) ?? str(raw.title) ?? 'Untitled',
    subtitle: str(book.subtitle),
    authors: Array.isArray(book.authors) ? book.authors.map((a: AnyRecord) => a.name).filter(Boolean) : [],
    genres: Array.isArray(book.genres) ? book.genres.map((g: AnyRecord) => g.name).filter(Boolean) : [],
    cover: str(edition.cover_image),
    publisher: str(edition.publisher?.name),
    publishYear: num(edition.publish_year) ?? num(book.original_year),
    pageCount: num(edition.page_count),
    format: str(edition.format),
    language: str(edition.language),
    isbn: str(edition.isbn13) ?? str(edition.isbn),
    ownership: str(raw.ownership_status),
    isLent: Boolean(raw.is_lent),
    lentTo: str(raw.lent_to),
    condition: str(raw.condition),
    isSigned: Boolean(raw.is_signed),
    acquiredAt: str(raw.order_received_date) ?? str(raw.order_placed_date),
    paidPrice: num(raw.paid_price),
    currency: str(raw.purchase_currency),
    notes: str(raw.personal_notes),
  };
}

function toSessions(list: unknown): MediaSession[] {
  if (!Array.isArray(list)) return [];
  return list.map((s: AnyRecord) => ({
    id: String(s.public_id ?? s.id ?? ''),
    status: (s.status ?? 'to_watch') as WatchStatus,
    startedAt: str(s.start_date) ?? str(s.startDate) ?? '',
    endedAt: str(s.end_date) ?? str(s.endDate) ?? null,
    isRewatch: Boolean(s.is_rewatch ?? s.isRewatch),
    rating: num(s.rating) ?? null,
    notes: str(s.notes) ?? null,
  }));
}

/* ------------------------------------------------------------------- api */

const order = { sort_order: 'desc' as const };

export const libraryApi = {
  watchPage: async (kind: MediaKind, page: number, search?: string): Promise<Page<MediaItem>> => {
    const path = kind === 'movie' ? '/logging/movies' : '/logging/series';
    const res = await api.get<Page<AnyRecord>>(path, {
      query: { page, page_size: PAGE_SIZE, sort_by: 'updatedAt', ...order, search: search || undefined },
    });
    return { ...res, items: (res.items ?? []).map(item => toMedia(item, kind)) };
  },

  bookPage: async (page: number, search?: string): Promise<Page<BookItem>> => {
    const res = await api.get<Page<AnyRecord>>('/books', {
      query: { page, page_size: PAGE_SIZE, sort_by: 'createdAt', ...order, search: search || undefined },
    });
    return { ...res, items: (res.items ?? []).map(toBook) };
  },

  mediaDetail: async (kind: MediaKind, id: string): Promise<MediaDetail> => {
    const path = kind === 'movie' ? '/logging/movies' : '/logging/series';
    const res = await api.get<AnyRecord>(`${path}/${id}`);
    return { item: toMedia(res, kind), sessions: toSessions(res.sessions) };
  },

  bookDetail: async (id: string): Promise<BookDetail> => {
    const res = await api.get<AnyRecord>(`/books/${id}`);
    return { item: toBook(res.item ?? {}), sessions: toSessions(res.sessions) };
  },
};
