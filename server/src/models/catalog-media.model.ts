import { Schema, model, Document, Types } from 'mongoose';

export interface ICatalogEpisode {
  episodeNumber: number;
  title: string;
  duration?: number | null;
  overview?: string | null;
}

export interface ICatalogSeason {
  seasonNumber: number;
  episodeCount: number;
  title?: string | null;
  year?: number | null;
  episodes: ICatalogEpisode[];
}

export interface ICatalogMedia extends Document {
  _id: Types.ObjectId;
  externalId: string;
  externalSource: string;
  type: 'movie' | 'series';
  title: string;
  titleLower: string;
  year?: number | null;
  creator?: string | null;
  posterUrl?: string | null;
  overview?: string | null;
  genres: string[];
  runtimeMinutes?: number | null;
  voteAverage?: number | null;
  seasons?: ICatalogSeason[];
  createdAt: Date;
  updatedAt: Date;
}

const CatalogEpisodeSchema = new Schema<ICatalogEpisode>(
  {
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true },
    duration: { type: Number, default: null },
    overview: { type: String, default: null },
  },
  { _id: false }
);

const CatalogSeasonSchema = new Schema<ICatalogSeason>(
  {
    seasonNumber: { type: Number, required: true },
    episodeCount: { type: Number, default: 0 },
    title: { type: String, default: null },
    year: { type: Number, default: null },
    episodes: { type: [CatalogEpisodeSchema], default: [] },
  },
  { _id: false }
);

const CatalogMediaSchema = new Schema<ICatalogMedia>(
  {
    externalId: {
      type: String,
      required: true,
      index: true,
    },
    externalSource: {
      type: String,
      required: true,
      default: 'tmdb',
      index: true,
    },
    type: {
      type: String,
      enum: ['movie', 'series'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    titleLower: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    year: {
      type: Number,
      default: null,
    },
    creator: {
      type: String,
      default: null,
    },
    posterUrl: {
      type: String,
      default: null,
    },
    overview: {
      type: String,
      default: null,
    },
    genres: {
      type: [String],
      default: [],
    },
    runtimeMinutes: {
      type: Number,
      default: null,
    },
    voteAverage: {
      type: Number,
      default: null,
    },
    seasons: {
      type: [CatalogSeasonSchema],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

CatalogMediaSchema.index({ externalSource: 1, externalId: 1, type: 1 }, { unique: true });
CatalogMediaSchema.index({ titleLower: 1, type: 1 });

export const CatalogMediaModel = model<ICatalogMedia>('CatalogMedia', CatalogMediaSchema);
