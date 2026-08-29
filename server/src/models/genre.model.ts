import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IGenre extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId?: Types.ObjectId | null;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const GenreSchema = new Schema<IGenre>(
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
      default: null,
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
  },
  {
    timestamps: true,
  }
);

GenreSchema.index({ userId: 1, slug: 1 });

export const GenreModel = model<IGenre>('Genre', GenreSchema);
