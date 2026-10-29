import { color } from '../../design/theme';

export type MediaType = 'movie' | 'series' | 'book';
export type RecordStatus = 'active' | 'dissolved';

export interface QuickLog {
  id: string;
  note: string;
  /** epoch ms captured on the device - this timestamp is the payload */
  stampedAt: number;
  synced: boolean;
}

export interface QuickRecord {
  id: string;
  mediaType: MediaType;
  title: string;
  status: RecordStatus;
  createdAt: number;
  updatedAt: number;
  logs: QuickLog[];
  synced: boolean;
  /** dissolution pushed to the server */
  dissolveSynced?: boolean;
  /** locally active again while the server still has it dissolved */
  restorePending?: boolean;
}

export const MEDIA_TYPES: MediaType[] = ['movie', 'series', 'book'];

export const MEDIA_LABEL: Record<MediaType, string> = {
  movie: 'Movie',
  series: 'Series',
  book: 'Book',
};

export const MEDIA_COLOR: Record<MediaType, string> = {
  movie: color.movie,
  series: color.series,
  book: color.book,
};
