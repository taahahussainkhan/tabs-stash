import { StashedSessionModel, ITabItem, IDeviceInfo } from '../models/session.model';
import { Types } from 'mongoose';

export interface ClientSessionChange {
  id: string;
  title: string;
  timestamp: number;
  isPinned?: boolean;
  isArchived?: boolean;
  archivedAt?: number | null;
  tags?: string[];
  tabs: ITabItem[];
  deviceInfo?: IDeviceInfo;
  clientUpdatedAt: number;
  deletedAt?: number | null;
}

export class SyncService {
  /**
   * Unified Delta Sync Protocol (Single-Collection with Tombstones)
   */
  static async deltaSync(
    userId: string,
    lastSyncedTimestamp: number,
    clientChanges: ClientSessionChange[]
  ) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    // 1. Process Push Phase (Client -> Server)
    if (clientChanges && clientChanges.length > 0) {
      for (const change of clientChanges) {
        const isArchived = change.isArchived === true;

        const existingSession = await StashedSessionModel.findOne({
          $or: [{ userId: userObjectId }, { userId: String(userId) }],
          sessionId: change.id,
        });

        if (!existingSession) {
          await StashedSessionModel.create({
            sessionId: change.id,
            userId: userObjectId,
            title: change.title,
            timestamp: change.timestamp,
            isPinned: change.isPinned || false,
            isArchived: isArchived,
            archivedAt: isArchived ? change.archivedAt || now : null,
            tags: change.tags || [],
            tabs: change.tabs || [],
            deviceInfo: change.deviceInfo || {},
            clientUpdatedAt: change.clientUpdatedAt,
            serverUpdatedAt: now,
            deletedAt: change.deletedAt || null,
          });
        } else if (change.clientUpdatedAt >= existingSession.clientUpdatedAt) {
          existingSession.title = change.title;
          existingSession.timestamp = change.timestamp;
          existingSession.isPinned = change.isPinned || false;
          existingSession.isArchived = isArchived;
          existingSession.archivedAt = isArchived
            ? change.archivedAt || existingSession.archivedAt || now
            : null;
          existingSession.tags = change.tags || [];
          existingSession.tabs = change.tabs || [];
          if (change.deviceInfo) existingSession.deviceInfo = change.deviceInfo;
          existingSession.clientUpdatedAt = change.clientUpdatedAt;
          existingSession.serverUpdatedAt = now;
          existingSession.deletedAt = change.deletedAt !== undefined ? change.deletedAt : existingSession.deletedAt;
          await existingSession.save();
        }
      }
    }

    // 2. Process Pull Phase (Server -> Client)
    const modifiedSessions = await StashedSessionModel.find({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      serverUpdatedAt: { $gt: lastSyncedTimestamp },
    }).lean();

    const serverChanges = modifiedSessions.map((s) => ({
      id: s.sessionId,
      sessionId: s.sessionId,
      title: s.title,
      timestamp: s.timestamp,
      isPinned: s.isPinned || false,
      isArchived: s.isArchived || false,
      archivedAt: s.archivedAt || null,
      tags: s.tags || [],
      tabs: s.tabs || [],
      deviceInfo: s.deviceInfo || {},
      clientUpdatedAt: s.clientUpdatedAt,
      serverUpdatedAt: s.serverUpdatedAt,
      deletedAt: s.deletedAt || null,
    }));

    return {
      serverChanges,
      newSyncTimestamp: now,
    };
  }

  /**
   * Get all active sessions for user
   */
  static async getActiveSessions(userId: string) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const sessions = await StashedSessionModel.find({
      $and: [
        { $or: [{ userId: userObjectId }, { userId: String(userId) }] },
        { isArchived: { $ne: true } },
        {
          $or: [
            { deletedAt: null },
            { deletedAt: { $exists: false } },
          ],
        },
      ],
    })
      .sort({ isPinned: -1, timestamp: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s.sessionId,
      sessionId: s.sessionId,
      title: s.title,
      timestamp: s.timestamp,
      isPinned: s.isPinned || false,
      isArchived: false,
      tags: s.tags || [],
      tabs: s.tabs || [],
      deviceInfo: s.deviceInfo || {},
      clientUpdatedAt: s.clientUpdatedAt,
      serverUpdatedAt: s.serverUpdatedAt,
    }));
  }

  /**
   * Get all archived sessions for user
   */
  static async getArchivedSessions(userId: string) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const sessions = await StashedSessionModel.find({
      $and: [
        { $or: [{ userId: userObjectId }, { userId: String(userId) }] },
        { isArchived: true },
        {
          $or: [
            { deletedAt: null },
            { deletedAt: { $exists: false } },
          ],
        },
      ],
    })
      .sort({ archivedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s.sessionId,
      sessionId: s.sessionId,
      title: s.title,
      timestamp: s.timestamp,
      isArchived: true,
      archivedAt: s.archivedAt,
      tags: s.tags || [],
      tabs: s.tabs || [],
      deviceInfo: s.deviceInfo || {},
      clientUpdatedAt: s.clientUpdatedAt,
      serverUpdatedAt: s.serverUpdatedAt,
    }));
  }

  /**
   * Upsert single session
   */
  static async upsertSingleSession(userId: string, data: ClientSessionChange) {
    return this.deltaSync(userId, 0, [data]);
  }

  /**
   * Soft delete session
   */
  static async deleteSession(userId: string, sessionId: string) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    await StashedSessionModel.updateOne(
      { $or: [{ userId: userObjectId }, { userId: String(userId) }], sessionId },
      { deletedAt: now, serverUpdatedAt: now }
    );

    return { success: true, deletedAt: now };
  }

  /**
   * Clear all sessions
   */
  static async clearAll(userId: string) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    await StashedSessionModel.updateMany(
      {
        $and: [
          { $or: [{ userId: userObjectId }, { userId: String(userId) }] },
          { $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
        ],
      },
      { deletedAt: now, serverUpdatedAt: now }
    );

    return { success: true, message: 'All sessions cleared' };
  }
}
