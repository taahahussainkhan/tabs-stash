import { z } from 'zod';
import {
  createSeriesSchema,
  updateSeriesSchema,
  updateEpisodeSchema,
  seasonStructureSchema,
} from '../validators/series.schema';
import { ISeries, ISeason, IEpisode } from '../models/series.model';
import { IMediaSession } from '../models/media-session.model';

export type CreateSeriesDTO = z.infer<typeof createSeriesSchema>['body'];
export type UpdateSeriesDTO = z.infer<typeof updateSeriesSchema>['body'];
export type UpdateEpisodeDTO = z.infer<typeof updateEpisodeSchema>['body'];
export type SeasonStructureDTO = z.infer<typeof seasonStructureSchema>;

export interface SeriesResponse {
  _id?: string;
  publicId: string;
  title: string;
  creator?: string | null;
  year?: number | null;
  genre?: string | null;
  posterImage?: string | null;
  platform?: string | null;
  externalId?: string | null;
  isFavorite: boolean;
  isWatchlist: boolean;
  tags: string[];
  referenceUrls?: {
    title: string;
    url: string;
    icon?: string;
  }[];
  seasons: ISeason[];
  activeSession?: Partial<IMediaSession> | null;
  sessions?: Partial<IMediaSession>[];
  comments?: any[];
  totalEpisodes?: number;
  watchedEpisodes?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
