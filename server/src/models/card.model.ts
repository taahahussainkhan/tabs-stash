import { Schema, model, Document, Types } from 'mongoose';

export type CardColor = 'charcoal' | 'terracotta' | 'ochre' | 'sage' | 'cyan' | 'purple';

export interface ICard {
  cardId: string;
  userId: Types.ObjectId | string;
  content: string;
  title?: string;
  color?: CardColor;
  tags?: string[];
  isPinned: boolean;
  sourceUrl?: string;
  savedAt: number;
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt?: number | null;
}

export interface ICardDocument extends Document {
  cardId: string;
  userId: Types.ObjectId | string;
  content: string;
  title?: string;
  color?: CardColor;
  tags?: string[];
  isPinned: boolean;
  sourceUrl?: string;
  savedAt: number;
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt?: number | null;
}

const CardSchema = new Schema<ICardDocument>(
  {
    cardId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.Mixed,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    color: {
      type: String,
      enum: ['charcoal', 'terracotta', 'ochre', 'sage', 'cyan', 'purple'],
      default: 'charcoal',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    savedAt: {
      type: Number,
      required: true,
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
        ret.id = ret.cardId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user queries and delta-sync
CardSchema.index({ userId: 1, serverUpdatedAt: 1 });
CardSchema.index({ userId: 1, cardId: 1 }, { unique: true });
CardSchema.index({ userId: 1, deletedAt: 1, isPinned: -1, savedAt: -1 });

export const CardModel = model<ICardDocument>('Card', CardSchema);
