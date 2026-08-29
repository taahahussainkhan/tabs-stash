import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IReferenceUrl {
  title: string;
  url: string;
  icon?: string;
}

export interface IMovie extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  title: string;
  director?: string | null;
  year?: number | null;
  genre?: string | null;
  posterImage?: string | null;
  platform?: string | null;
  durationMinutes?: number | null;
  isFavorite: boolean;
  isWatchlist: boolean;
  currentSessionId?: Types.ObjectId | null;
  linkedTabSessions: Types.ObjectId[];
  referenceUrls: IReferenceUrl[];
  tags: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ReferenceUrlSchema = new Schema<IReferenceUrl>(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: '' },
  },
  { _id: false }
);

const MovieSchema = new Schema<IMovie>(
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
    director: {
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
    durationMinutes: {
      type: Number,
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
    linkedTabSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StashedSession',
      },
    ],
    referenceUrls: {
      type: [ReferenceUrlSchema],
      default: [],
    },
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

MovieSchema.index({ userId: 1, title: 1 });
MovieSchema.index({ userId: 1, isFavorite: 1 });
MovieSchema.index({ userId: 1, isWatchlist: 1 });
MovieSchema.index({ userId: 1, updatedAt: -1 });

export const MovieModel = model<IMovie>('Movie', MovieSchema);
