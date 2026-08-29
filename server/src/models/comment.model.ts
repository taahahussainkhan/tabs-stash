import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IComment extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  loggableType: 'session' | 'movie' | 'series' | 'episode' | 'book';
  loggableId: string | Types.ObjectId; // Session publicId or entity ObjectId
  content: string;
  timestamp?: number | null; // seconds into movie/episode or page number
  chapterOrEpisode?: string | null;
  isSpoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
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
    loggableType: {
      type: String,
      required: true,
      enum: ['session', 'movie', 'series', 'episode', 'book'],
      index: true,
    },
    loggableId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      default: null,
    },
    chapterOrEpisode: {
      type: String,
      default: null,
    },
    isSpoiler: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ userId: 1, loggableType: 1, loggableId: 1, createdAt: 1 });

export const CommentModel = model<IComment>('Comment', CommentSchema);
