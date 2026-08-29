import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IAuthor extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  name: string;
  bio?: string | null;
  country?: string | null;
  language?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  website?: string | null;
  imageUrl?: string | null;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
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
      index: true,
    },
    bio: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: null,
    },
    birthYear: {
      type: Number,
      default: null,
    },
    deathYear: {
      type: Number,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isPredefined: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AuthorSchema.index({ userId: 1, name: 1 });

export const AuthorModel = model<IAuthor>('Author', AuthorSchema);
