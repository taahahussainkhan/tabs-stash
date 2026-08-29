import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IPublisher extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  name: string;
  country?: string | null;
  foundedYear?: number | null;
  website?: string | null;
  description?: string | null;
  isPredefined: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PublisherSchema = new Schema<IPublisher>(
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
    country: {
      type: String,
      default: null,
    },
    foundedYear: {
      type: Number,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    description: {
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

PublisherSchema.index({ userId: 1, name: 1 });

export const PublisherModel = model<IPublisher>('Publisher', PublisherSchema);
