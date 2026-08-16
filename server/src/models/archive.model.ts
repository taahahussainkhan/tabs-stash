import { Schema, model, Document, Types } from 'mongoose';
import { ITabItem, IDeviceInfo } from './session.model';

export interface IArchivedSession extends Document {
  sessionId: string;
  userId: Types.ObjectId;
  title: string;
  timestamp: number;
  archivedAt: number;
  tags: string[];
  tabs: ITabItem[];
  deviceInfo?: IDeviceInfo;
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt: number | null;
  createdAt: Date;
  updatedAt: Date;
}

const TabItemSchema = new Schema<ITabItem>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    favIconUrl: { type: String, default: '' },
    hostname: { type: String, default: 'local' },
    pinned: { type: Boolean, default: false },
    isPopped: { type: Boolean, default: false },
    poppedAt: { type: Number, default: null },
    stashedAt: { type: Number, required: true },
  },
  { _id: false }
);

const DeviceInfoSchema = new Schema<IDeviceInfo>(
  {
    deviceId: { type: String, default: '' },
    deviceName: { type: String, default: 'My PC' },
    platform: { type: String, default: 'Unknown' },
    browser: { type: String, default: 'Browser' },
    windowId: { type: Schema.Types.Mixed, default: 1 },
  },
  { _id: false }
);

const ArchivedSessionSchema = new Schema<IArchivedSession>(
  {
    sessionId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    timestamp: { type: Number, required: true },
    archivedAt: { type: Number, required: true, default: () => Date.now() },
    tags: { type: [String], default: [] },
    tabs: { type: [TabItemSchema], default: [] },
    deviceInfo: { type: DeviceInfoSchema, default: () => ({}) },
    clientUpdatedAt: { type: Number, required: true },
    serverUpdatedAt: { type: Number, required: true },
    deletedAt: { type: Number, default: null },
  },
  {
    timestamps: true,
    collection: 'archived_sessions',
  }
);

// Compound indexes for high-speed sync and retrieval
ArchivedSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
ArchivedSessionSchema.index({ userId: 1, serverUpdatedAt: 1 });
ArchivedSessionSchema.index({ userId: 1, deletedAt: 1 });

export const ArchivedSessionModel = model<IArchivedSession>('ArchivedSession', ArchivedSessionSchema);
