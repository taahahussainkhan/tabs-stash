import { StashedSessionModel, ITabItem, IDeviceInfo } from '../models/session.model';
import { ArchivedSessionModel } from '../models/archive.model';
import { Types } from 'mongoose';
import { AppError } from '../middlewares/error.middleware';

export interface ClientSessionChange {
  id: string;
  title: string;
  timestamp: number;
  isPinned: boolean;
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
   * Normalized Delta Sync Protocol
   * 1. Routes active sessions into `stashed_sessions` (StashedSessionModel)
   * 2. Routes archived sessions into `archived_sessions` (ArchivedSessionModel)
   * 3. Pulls changes from both collections updated since lastSyncedTimestamp
   */
  static async deltaSync(
    userId: string,
    lastSyncedTimestamp: number,
    clientChanges: ClientSessionChange[]
  ) {
    const userObjectId = new Types.ObjectId(userId);
    const now = Date.now();

    // 1. Process Push Phase (Client -> Server)
    if (clientChanges && clientChanges.length > 0) {
      for (const change of clientChanges) {
        const isArchived = change.isArchived === true;

        if (isArchived) {
          // Store in ArchivedSessionModel
          const existingArchive = await ArchivedSessionModel.findOne({
            userId: userObjectId,
            sessionId: change.id,
          });

          if (!existingArchive) {
            await ArchivedSessionModel.create({
              sessionId: change.id,
              userId: userObjectId,
              title: change.title,
              timestamp: change.timestamp,
              archivedAt: change.archivedAt || now,
              tags: change.tags || [],
              tabs: change.tabs || [],
              deviceInfo: change.deviceInfo || {},
              clientUpdatedAt: change.clientUpdatedAt,
              serverUpdatedAt: now,
              deletedAt: change.deletedAt || null,
            });
          } else if (change.clientUpdatedAt >= existingArchive.clientUpdatedAt) {
            existingArchive.title = change.title;
            existingArchive.timestamp = change.timestamp;
            existingArchive.archivedAt = change.archivedAt || existingArchive.archivedAt;
            existingArchive.tags = change.tags || [];
            existingArchive.tabs = change.tabs || [];
            if (change.deviceInfo) existingArchive.deviceInfo = change.deviceInfo;
            existingArchive.clientUpdatedAt = change.clientUpdatedAt;
            existingArchive.serverUpdatedAt = now;
            existingArchive.deletedAt = change.deletedAt ?? existingArchive.deletedAt;
            await existingArchive.save();
          }

          // Soft-delete or remove from active sessions collection if it existed there
          await StashedSessionModel.deleteOne({ userId: userObjectId, sessionId: change.id });
        } else {
          // Store in StashedSessionModel
          const existingActive = await StashedSessionModel.findOne({
            userId: userObjectId,
            sessionId: change.id,
          });

          if (!existingActive) {
            await StashedSessionModel.create({
              sessionId: change.id,
              userId: userObjectId,
              title: change.title,
              timestamp: change.timestamp,
              isPinned: change.isPinned || false,
              tags: change.tags || [],
              tabs: change.tabs || [],
              deviceInfo: change.deviceInfo || {},
              clientUpdatedAt: change.clientUpdatedAt,
              serverUpdatedAt: now,
              deletedAt: change.deletedAt || null,
            });
          } else if (change.clientUpdatedAt >= existingActive.clientUpdatedAt) {
            existingActive.title = change.title;
            existingActive.timestamp = change.timestamp;
            existingActive.isPinned = change.isPinned || false;
            existingActive.tags = change.tags || [];
            existingActive.tabs = change.tabs || [];
            if (change.deviceInfo) existingActive.deviceInfo = change.deviceInfo;
            existingActive.clientUpdatedAt = change.clientUpdatedAt;
            existingActive.serverUpdatedAt = now;
            existingActive.deletedAt = change.deletedAt ?? existingActive.deletedAt;
            await existingActive.save();
          }

          // Remove from archived sessions collection if it was unarchived
          await ArchivedSessionModel.deleteOne({ userId: userObjectId, sessionId: change.id });
        }
      }
    }

    // 2. Process Pull Phase (Server -> Client)
    // Find modified active sessions
    const modifiedActive = await StashedSessionModel.find({
      userId: userObjectId,
      serverUpdatedAt: { $gt: lastSyncedTimestamp },
    }).lean();

    // Find modified archived sessions
    const modifiedArchived = await ArchivedSessionModel.find({
      userId: userObjectId,
      serverUpdatedAt: { $gt: lastSyncedTimestamp },
    }).lean();

    const serverChanges = [
      ...modifiedActive.map((s) => ({
        id: s.sessionId,
        title: s.title,
        timestamp: s.timestamp,
        isPinned: s.isPinned,
        isArchived: false,
        archivedAt: null,
        tags: s.tags,
        tabs: s.tabs,
        deviceInfo: s.deviceInfo,
        clientUpdatedAt: s.clientUpdatedAt,
        serverUpdatedAt: s.serverUpdatedAt,
        deletedAt: s.deletedAt,
      })),
      ...modifiedArchived.map((a) => ({
        id: a.sessionId,
        title: a.title,
        timestamp: a.timestamp,
        isPinned: false,
        isArchived: true,
        archivedAt: a.archivedAt,
        tags: a.tags,
        tabs: a.tabs,
        deviceInfo: a.deviceInfo,
        clientUpdatedAt: a.clientUpdatedAt,
        serverUpdatedAt: a.serverUpdatedAt,
        deletedAt: a.deletedAt,
      })),
    ];

    return {
      serverChanges,
      newSyncTimestamp: now,
    };
  }

  /**
   * Get all active sessions for user
   */
  static async getActiveSessions(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const sessions = await StashedSessionModel.find({
      userId: userObjectId,
      deletedAt: null,
    })
      .sort({ isPinned: -1, timestamp: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s.sessionId,
      title: s.title,
      timestamp: s.timestamp,
      isPinned: s.isPinned,
      isArchived: false,
      tags: s.tags,
      tabs: s.tabs,
      deviceInfo: s.deviceInfo,
      clientUpdatedAt: s.clientUpdatedAt,
      serverUpdatedAt: s.serverUpdatedAt,
    }));
  }

  /**
   * Get all archived sessions for user
   */
  static async getArchivedSessions(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const sessions = await ArchivedSessionModel.find({
      userId: userObjectId,
      deletedAt: null,
    })
      .sort({ archivedAt: -1 })
      .lean();

    return sessions.map((s) => ({
      id: s.sessionId,
      title: s.title,
      timestamp: s.timestamp,
      isArchived: true,
      archivedAt: s.archivedAt,
      tags: s.tags,
      tabs: s.tabs,
      deviceInfo: s.deviceInfo,
      clientUpdatedAt: s.clientUpdatedAt,
      serverUpdatedAt: s.serverUpdatedAt,
    }));
  }

  /**
   * Upsert single session
   */
  static async upsertSingleSession(userId: string, data: ClientSessionChange) {
    const result = await this.deltaSync(userId, 0, [data]);
    return result;
  }

  /**
   * Soft delete session
   */
  static async deleteSession(userId: string, sessionId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const now = Date.now();

    await StashedSessionModel.updateOne(
      { userId: userObjectId, sessionId },
      { deletedAt: now, serverUpdatedAt: now }
    );
    await ArchivedSessionModel.updateOne(
      { userId: userObjectId, sessionId },
      { deletedAt: now, serverUpdatedAt: now }
    );

    return { success: true, deletedAt: now };
  }

  /**
   * Clear all sessions
   */
  static async clearAll(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const now = Date.now();

    await StashedSessionModel.updateMany(
      { userId: userObjectId, deletedAt: null },
      { deletedAt: now, serverUpdatedAt: now }
    );
    await ArchivedSessionModel.updateMany(
      { userId: userObjectId, deletedAt: null },
      { deletedAt: now, serverUpdatedAt: now }
    );

    return { success: true, message: 'All sessions cleared' };
  }
}
