import { z } from 'zod';
import {
  createMovieSchema,
  createWatchlistMovieSchema,
  updateMovieSchema,
  rewatchMovieSchema,
  toggleFlagSchema,
} from '../validators/movie.schema';
import { IMovie } from '../models/movie.model';
import { IMediaSession } from '../models/media-session.model';

export type CreateMovieDTO = z.infer<typeof createMovieSchema>['body'];
export type CreateWatchlistMovieDTO = z.infer<typeof createWatchlistMovieSchema>['body'];
export type UpdateMovieDTO = z.infer<typeof updateMovieSchema>['body'];
export type RewatchMovieDTO = z.infer<typeof rewatchMovieSchema>['body'];
export type ToggleMovieFlagDTO = z.infer<typeof toggleFlagSchema>['body'];

export interface MovieResponse {
  _id?: string;
  publicId: string;
  title: string;
  director?: string | null;
  year?: number | null;
  genre?: string | null;
  posterImage?: string | null;
  platform?: string | null;
  durationMinutes?: number | null;
  externalId?: string | null;
  isFavorite: boolean;
  isWatchlist: boolean;
  tags: string[];
  referenceUrls?: {
    title: string;
    url: string;
    icon?: string;
  }[];
  activeSession?: Partial<IMediaSession> | null;
  sessions?: Partial<IMediaSession>[];
  comments?: any[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
