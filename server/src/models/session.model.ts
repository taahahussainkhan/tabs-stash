import { Schema, model, Document, Types } from 'mongoose';

export interface ITabItem {
  id: string;
  title: string;
  url: string;
  favIconUrl?: string;
  hostname?: string;
  pinned?: boolean;
  isPopped?: boolean;
  poppedAt?: number | null;
  stashedAt: number;
}

export interface IDeviceInfo {
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
  windowId?: number | string;
}

export interface IStashedSession extends Document {
  sessionId: string; // Client generated ID (e.g. 'session_1723812345')
  userId: Types.ObjectId;
  title: string;
  timestamp: number;
  isPinned: boolean;
  isArchived: boolean;
  archivedAt: number | null;
  tags: string[];
  tabs: ITabItem[];
  deviceInfo?: IDeviceInfo;
  clientUpdatedAt: number;
  serverUpdatedAt: number;
  deletedAt: number | null; // Tombstone for soft deletes during delta sync
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

const StashedSessionSchema = new Schema<IStashedSession>(
  {
    sessionId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    timestamp: { type: Number, required: true },
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    archivedAt: { type: Number, default: null },
    tags: { type: [String], default: [] },
    tabs: { type: [TabItemSchema], default: [] },
    deviceInfo: { type: DeviceInfoSchema, default: () => ({}) },
    clientUpdatedAt: { type: Number, required: true },
    serverUpdatedAt: { type: Number, required: true },
    deletedAt: { type: Number, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for ultra-fast sync queries
StashedSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });
StashedSessionSchema.index({ userId: 1, serverUpdatedAt: 1 });
StashedSessionSchema.index({ userId: 1, deletedAt: 1 });

export const StashedSessionModel = model<IStashedSession>('StashedSession', StashedSessionSchema);
