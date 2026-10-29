import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export type QuickMediaType = 'movie' | 'series' | 'book';
export type QuickRecordStatus = 'active' | 'dissolved';

/**
 * QuickRecord: the mobile-first, capture-anything entity.
 * A record is just "a thing" (movie/series/book) with a name.
 * All semantics live in the timestamps of its QuickLogs,
 * which the user can stamp from the phone in one tap and
 * amp (fill in properly) later on the web app.
 */
export interface IQuickRecord extends Document {
  _id: Types.ObjectId;
  publicId: string; // client-generated UUID, stable across devices
  userId: Types.ObjectId;
  mediaType: QuickMediaType;
  title: string;
  status: QuickRecordStatus;
  dissolvedAt: number | null; // epoch ms; soft-remove, never hard-deleted
  ampedAt: number | null; // epoch ms once the web app has promoted it into a full session
  linkedMediaType?: QuickMediaType | null; // set when amped into a real Movie/Series/Book
  linkedMediaId?: string | null;
  clientUpdatedAt: number;
  serverUpdatedAt: number;
}

const QuickRecordSchema = new Schema<IQuickRecord>(
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
      enum: ['movie', 'series', 'book'],
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'dissolved'],
      default: 'active',
      index: true,
    },
    dissolvedAt: {
      type: Number,
      default: null,
    },
    ampedAt: {
      type: Number,
      default: null,
      index: true,
    },
    linkedMediaType: {
      type: String,
      enum: ['movie', 'series', 'book', null],
      default: null,
    },
    linkedMediaId: {
      type: String,
      default: null,
    },
    clientUpdatedAt: {
      type: Number,
      required: true,
    },
    serverUpdatedAt: {
      type: Number,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret.publicId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

QuickRecordSchema.index({ userId: 1, publicId: 1 }, { unique: true });
QuickRecordSchema.index({ userId: 1, status: 1, serverUpdatedAt: -1 });

export const QuickRecordModel = model<IQuickRecord>('QuickRecord', QuickRecordSchema);
