import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface ITag extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  name: string;
  slug: string;
  color: string;
  category?: string; // 'entertainment', 'reading', 'work', 'research'
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    color: {
      type: String,
      default: '#e05a47',
    },
    category: {
      type: String,
      default: 'general',
    },
  },
  {
    timestamps: true,
  }
);

TagSchema.index({ userId: 1, slug: 1 }, { unique: true });

export const TagModel = model<ITag>('Tag', TagSchema);
