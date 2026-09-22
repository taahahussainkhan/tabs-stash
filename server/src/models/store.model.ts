import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface IStore extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  name: string;
  type: 'OnlineOnly' | 'PhysicalOnly' | 'Hybrid';
  website?: string | null;
  physicalAddress?: string | null;
  country?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
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
    type: {
      type: String,
      enum: ['OnlineOnly', 'PhysicalOnly', 'Hybrid'],
      default: 'Hybrid',
    },
    website: {
      type: String,
      default: null,
      trim: true,
    },
    physicalAddress: {
      type: String,
      default: null,
      trim: true,
    },
    country: {
      type: String,
      default: null,
      trim: true,
    },
    notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

StoreSchema.index({ userId: 1, name: 1 });

export const StoreModel = model<IStore>('Store', StoreSchema);
