import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IEpisode {
  publicId: string;
  episodeNumber: number;
  title: string;
  duration?: number | null; // minutes
  isWatched: boolean;
  watchedDate?: Date | null;
  currentTimestamp?: number | null; // seconds
  rating?: number | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISeason {
  publicId: string;
  seasonNumber: number;
  title?: string | null;
  year?: number | null;
  episodeCount?: number | null;
  notes?: string | null;
  episodes: IEpisode[];
}

export interface ISeries extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  title: string;
  creator?: string | null;
  year?: number | null;
  genre?: string | null;
  posterImage?: string | null;
  platform?: string | null;
  isFavorite: boolean;
  isWatchlist: boolean;
  currentSessionId?: Types.ObjectId | null;
  seasons: ISeason[];
  linkedTabSessions: Types.ObjectId[];
  referenceUrls: Array<{ title: string; url: string; icon?: string }>;
  tags: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EpisodeSchema = new Schema<IEpisode>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: null,
    },
    isWatched: {
      type: Boolean,
      default: false,
    },
    watchedDate: {
      type: Date,
      default: null,
    },
    currentTimestamp: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const SeasonSchema = new Schema<ISeason>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
    },
    seasonNumber: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    episodeCount: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    episodes: {
      type: [EpisodeSchema],
      default: [],
    },
  },
  { _id: false }
);

const SeriesSchema = new Schema<ISeries>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    creator: {
      type: String,
      trim: true,
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    genre: {
      type: String,
      trim: true,
      default: null,
    },
    posterImage: {
      type: String,
      default: null,
    },
    platform: {
      type: String,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isWatchlist: {
      type: Boolean,
      default: false,
      index: true,
    },
    currentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaSession',
      default: null,
    },
    seasons: {
      type: [SeasonSchema],
      default: [],
    },
    linkedTabSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StashedSession',
      },
    ],
    referenceUrls: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: '' },
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
  },
  {
    timestamps: true,
  }
);

SeriesSchema.index({ userId: 1, title: 1 });
SeriesSchema.index({ userId: 1, isFavorite: 1 });
SeriesSchema.index({ userId: 1, isWatchlist: 1 });
SeriesSchema.index({ userId: 1, updatedAt: -1 });

export const SeriesModel = model<ISeries>('Series', SeriesSchema);
