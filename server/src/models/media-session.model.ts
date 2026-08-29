import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IPauseLog {
  pausedAt: Date;
  resumedAt?: Date | null;
  reason?: string;
}

export interface IMediaSession extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  mediaType: 'movie' | 'series' | 'book' | 'article';
  mediaId: Types.ObjectId;
  status: 'watching' | 'reading' | 'completed' | 'paused' | 'dropped' | 'rewatching';
  startDate: Date;
  endDate?: Date | null;
  currentPosition?: number | null; // Seconds for movies/series, pages for books
  stopReason?: string | null;
  isRewatch: boolean;
  rating?: number | null;
  notes?: string | null;
  pauseLogs: IPauseLog[];
  createdAt: Date;
  updatedAt: Date;
}

const PauseLogSchema = new Schema<IPauseLog>(
  {
    pausedAt: { type: Date, required: true, default: Date.now },
    resumedAt: { type: Date, default: null },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const MediaSessionSchema = new Schema<IMediaSession>(
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
    mediaType: {
      type: String,
      required: true,
      enum: ['movie', 'series', 'book', 'article'],
      index: true,
    },
    mediaId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['watching', 'reading', 'completed', 'paused', 'dropped', 'rewatching'],
      default: 'watching',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    currentPosition: {
      type: Number,
      default: 0,
    },
    stopReason: {
      type: String,
      default: null,
    },
    isRewatch: {
      type: Boolean,
      default: false,
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
    pauseLogs: {
      type: [PauseLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

MediaSessionSchema.index({ userId: 1, mediaType: 1, mediaId: 1 });
MediaSessionSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export const MediaSessionModel = model<IMediaSession>('MediaSession', MediaSessionSchema);
