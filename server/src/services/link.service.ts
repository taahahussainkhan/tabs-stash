import { SavedLinkModel, ISavedLink } from '../models/link.model';
import { Types } from 'mongoose';
import { CreateLinkInput, LinkChangeInput } from '../validators/link.schema';
import { AppError } from '../middlewares/error.middleware';

export class LinkService {
  /**
   * Get all active (non-deleted) saved links for a user
   */
  static async getActiveLinks(userId: string): Promise<(ISavedLink & { id: string })[]> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const links = await SavedLinkModel.find({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      deletedAt: null,
    })
      .sort({ savedAt: -1 })
      .lean();

    return links.map((l) => ({
      id: l.linkId,
      linkId: l.linkId,
      userId: l.userId,
      url: l.url,
      title: l.title,
      hostname: l.hostname,
      pageUrl: l.pageUrl,
      savedAt: l.savedAt,
      isRead: l.isRead,
      readAt: l.readAt,
      tags: l.tags,
      clientUpdatedAt: l.clientUpdatedAt,
      serverUpdatedAt: l.serverUpdatedAt,
    }));
  }

  /**
   * Save / Upsert a single link
   */
  static async saveLink(userId: string, input: CreateLinkInput): Promise<ISavedLink & { id: string }> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();
    const linkId = input.id || 'link_' + now + '_' + Math.random().toString(36).substr(2, 6);

    let hostname = input.hostname || 'link';
    if (!input.hostname) {
      try {
        hostname = new URL(input.url).hostname.replace(/^www\./, '');
      } catch {}
    }

    const doc = await SavedLinkModel.findOneAndUpdate(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        linkId,
      },
      {
        $set: {
          url: input.url,
          title: input.title || hostname || 'Saved Link',
          hostname,
          pageUrl: input.pageUrl || '',
          tags: input.tags || [],
          clientUpdatedAt: now,
          serverUpdatedAt: now,
          deletedAt: null,
        },
        $setOnInsert: {
          linkId,
          userId: userObjectId,
          savedAt: now,
          isRead: false,
          readAt: null,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return {
      id: doc.linkId,
      linkId: doc.linkId,
      userId: doc.userId,
      url: doc.url,
      title: doc.title,
      hostname: doc.hostname,
      pageUrl: doc.pageUrl,
      savedAt: doc.savedAt,
      isRead: doc.isRead,
      readAt: doc.readAt,
      tags: doc.tags,
      clientUpdatedAt: doc.clientUpdatedAt,
      serverUpdatedAt: doc.serverUpdatedAt,
    };
  }

  /**
   * Toggle read status of a link
   */
  static async toggleLinkRead(userId: string, linkId: string, isRead: boolean): Promise<void> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();
    const result = await SavedLinkModel.updateOne(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        linkId,
      },
      {
        $set: {
          isRead,
          readAt: isRead ? now : null,
          clientUpdatedAt: now,
          serverUpdatedAt: now,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Saved link not found', 404);
    }
  }

  /**
   * Delete link (soft delete for sync propagation)
   */
  static async deleteLink(userId: string, linkId: string): Promise<void> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();
    const result = await SavedLinkModel.updateOne(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        linkId,
      },
      {
        $set: {
          deletedAt: now,
          clientUpdatedAt: now,
          serverUpdatedAt: now,
        },
      }
    );

    if (result.matchedCount === 0) {
      throw new AppError('Saved link not found', 404);
    }
  }

  /**
   * Delta Sync for Saved Links across multiple clients/devices
   */
  static async deltaSync(
    userId: string,
    lastSyncedTimestamp: number,
    clientChanges: LinkChangeInput[]
  ) {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    // 1. Process client changes
    if (clientChanges && clientChanges.length > 0) {
      for (const change of clientChanges) {
        const existing = await SavedLinkModel.findOne({
          $or: [{ userId: userObjectId }, { userId: String(userId) }],
          linkId: change.id,
        });

        if (!existing) {
          await SavedLinkModel.create({
            linkId: change.id,
            userId: userObjectId,
            url: change.url,
            title: change.title,
            hostname: change.hostname || 'link',
            pageUrl: change.pageUrl || '',
            savedAt: change.savedAt || now,
            isRead: !!change.isRead,
            readAt: change.readAt || null,
            tags: change.tags || [],
            clientUpdatedAt: change.clientUpdatedAt,
            serverUpdatedAt: now,
            deletedAt: change.deletedAt || null,
          });
        } else if (change.clientUpdatedAt >= existing.clientUpdatedAt) {
          existing.url = change.url;
          existing.title = change.title;
          existing.hostname = change.hostname || existing.hostname;
          existing.pageUrl = change.pageUrl || existing.pageUrl;
          existing.isRead = !!change.isRead;
          existing.readAt = change.readAt ?? existing.readAt;
          existing.tags = change.tags || existing.tags;
          existing.clientUpdatedAt = change.clientUpdatedAt;
          existing.serverUpdatedAt = now;
          existing.deletedAt = change.deletedAt ?? existing.deletedAt;
          await existing.save();
        }
      }
    }

    // 2. Fetch server changes modified since lastSyncedTimestamp
    const serverDocs = await SavedLinkModel.find({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      serverUpdatedAt: { $gt: lastSyncedTimestamp },
    }).lean();

    const serverChanges = serverDocs.map((doc) => ({
      id: doc.linkId,
      url: doc.url,
      title: doc.title,
      hostname: doc.hostname,
      pageUrl: doc.pageUrl,
      savedAt: doc.savedAt,
      isRead: doc.isRead,
      readAt: doc.readAt,
      tags: doc.tags,
      clientUpdatedAt: doc.clientUpdatedAt,
      serverUpdatedAt: doc.serverUpdatedAt,
      deletedAt: doc.deletedAt,
    }));

    return {
      serverChanges,
      newSyncTimestamp: now,
    };
  }
}
