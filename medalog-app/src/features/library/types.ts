import { color } from '../../design/theme';

/** Same vocabulary the web dashboard uses for a watch/read session. */
export type WatchStatus = 'to_watch' | 'watching' | 'completed' | 'paused' | 'rewatching';

/** Things that carry a session history. */
export type MediaKind = 'movie' | 'series';

/** Everything the Library tab shows. */
export type LibraryKind = MediaKind | 'book';

export interface SeasonSummary {
  seasonNumber: number;
  episodeCount: number;
  title?: string;
  year?: number;
}

export interface MediaSession {
  id: string;
  status: WatchStatus;
  startedAt: string;
  endedAt?: string | null;
  isRewatch: boolean;
  rating?: number | null;
  notes?: string | null;
}

/** A movie or a series, flattened to one shape. */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  title: string;
  /** director (movies) or creator (series) */
  creator?: string;
  year?: number;
  genre?: string;
  poster?: string;
  platform?: string;
  rating?: number;
  notes?: string;
  status: WatchStatus;
  startedAt?: string;
  endedAt?: string | null;
  isFavorite: boolean;
  isWatchlist: boolean;
  rewatchCount: number;
  totalEpisodes?: number;
  episodesWatched?: number;
  seasons?: SeasonSummary[];
}

export interface MediaDetail {
  item: MediaItem;
  sessions: MediaSession[];
}

/** A physical copy of a book, flattened from `BookItem`. */
export interface BookItem {
  id: number;
  publicId: string;
  title: string;
  subtitle?: string;
  authors: string[];
  genres: string[];
  cover?: string;
  publisher?: string;
  publishYear?: number;
  pageCount?: number;
  format?: string;
  language?: string;
  isbn?: string;
  ownership?: string;
  isLent: boolean;
  lentTo?: string;
  condition?: string;
  isSigned: boolean;
  acquiredAt?: string;
  paidPrice?: number;
  currency?: string;
  notes?: string;
}

export interface BookDetail {
  item: BookItem;
  sessions: MediaSession[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export const STATUS_TINT: Record<WatchStatus, string> = {
  to_watch: color.textMuted,
  watching: color.accent,
  completed: color.success,
  paused: color.warning,
  rewatching: color.series,
};

/** "To watch" reads wrong on a book, so the label depends on the kind. */
export function statusLabel(status: WatchStatus, kind: LibraryKind): string {
  if (status === 'to_watch') return kind === 'book' ? 'To read' : 'To watch';
  if (status === 'watching') return kind === 'book' ? 'Reading' : 'Watching';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export const KIND_LABEL: Record<LibraryKind, string> = {
  movie: 'Movie',
  series: 'Series',
  book: 'Book',
};

export const KIND_COLOR: Record<LibraryKind, string> = {
  movie: color.movie,
  series: color.series,
  book: color.book,
};
