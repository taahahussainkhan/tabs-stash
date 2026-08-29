import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  entityType: 'movie' | 'series' | 'book' | 'tab_stash' | 'session' | 'tag' | 'auth';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'completed' | 'paused' | 'resumed' | 'rated' | 'stashed' | 'lent' | 'returned';
  summary: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
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
    entityType: {
      type: String,
      required: true,
      enum: ['movie', 'series', 'book', 'tab_stash', 'session', 'tag', 'auth'],
      index: true,
    },
    entityId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLogModel = model<IActivityLog>('ActivityLog', ActivityLogSchema);
