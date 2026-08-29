import { Schema, model, Document, Types } from 'mongoose';

export interface ISavedLink {
  linkId: string;
  userId: Types.ObjectId | string;
  url: string;
  title: string;
  hostname: string;
  pageUrl?: string;
  savedAt: number;
  isRead: boolean;
  readAt?: number | null;
  tags?: string[];
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt?: number | null;
}

export interface ISavedLinkDocument extends Document {
  linkId: string;
  userId: Types.ObjectId | string;
  url: string;
  title: string;
  hostname: string;
  pageUrl?: string;
  savedAt: number;
  isRead: boolean;
  readAt?: number | null;
  tags?: string[];
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt?: number | null;
}

const SavedLinkSchema = new Schema<ISavedLinkDocument>(
  {
    linkId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    hostname: {
      type: String,
      required: true,
      index: true,
    },
    pageUrl: {
      type: String,
      default: '',
    },
    savedAt: {
      type: Number,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Number,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
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
    deletedAt: {
      type: Number,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret.linkId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user sync queries
SavedLinkSchema.index({ userId: 1, serverUpdatedAt: 1 });
SavedLinkSchema.index({ userId: 1, linkId: 1 }, { unique: true });
SavedLinkSchema.index({ userId: 1, deletedAt: 1, isRead: 1 });

export const SavedLinkModel = model<ISavedLinkDocument>('SavedLink', SavedLinkSchema);
