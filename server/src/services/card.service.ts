import { CardModel, ICard, CardColor } from '../models/card.model';
import { Types } from 'mongoose';
import { CreateCardInput, UpdateCardInput, CardChangeInput } from '../validators/card.schema';
import { AppError } from '../middlewares/error.middleware';

export class CardService {
  /**
   * Get all active (non-deleted) cards for a user, sorted by pinned first, then newest
   */
  static async getActiveCards(userId: string): Promise<(ICard & { id: string })[]> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const cards = await CardModel.find({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      deletedAt: null,
    })
      .sort({ isPinned: -1, savedAt: -1 })
      .lean();

    return cards.map((c) => ({
      id: c.cardId,
      cardId: c.cardId,
      userId: c.userId,
      content: c.content,
      title: c.title || '',
      color: (c.color as CardColor) || 'charcoal',
      tags: c.tags || [],
      isPinned: !!c.isPinned,
      sourceUrl: c.sourceUrl || '',
      savedAt: c.savedAt,
      clientUpdatedAt: c.clientUpdatedAt,
      serverUpdatedAt: c.serverUpdatedAt,
    }));
  }

  /**
   * Save / Upsert a single card
   */
  static async saveCard(userId: string, input: CreateCardInput): Promise<ICard & { id: string }> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();
    const cardId = input.id || 'card_' + now + '_' + Math.random().toString(36).substr(2, 6);

    // Auto-generate title from first line if not provided
    let title = input.title ? input.title.trim() : '';
    if (!title && input.content) {
      const firstLine = input.content.split('\n')[0].trim();
      title = firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
    }

    const doc = await CardModel.findOneAndUpdate(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        cardId,
      },
      {
        $set: {
          content: input.content,
          title,
          color: input.color || 'charcoal',
          tags: input.tags || [],
          isPinned: !!input.isPinned,
          sourceUrl: input.sourceUrl || '',
          clientUpdatedAt: now,
          serverUpdatedAt: now,
          deletedAt: null,
        },
        $setOnInsert: {
          cardId,
          userId: userObjectId,
          savedAt: now,
        },
      },
      { upsert: true, new: true }
    ).lean();

    return {
      id: doc.cardId,
      cardId: doc.cardId,
      userId: doc.userId,
      content: doc.content,
      title: doc.title,
      color: (doc.color as CardColor) || 'charcoal',
      tags: doc.tags,
      isPinned: !!doc.isPinned,
      sourceUrl: doc.sourceUrl,
      savedAt: doc.savedAt,
      clientUpdatedAt: doc.clientUpdatedAt,
      serverUpdatedAt: doc.serverUpdatedAt,
    };
  }

  /**
   * Update an existing card
   */
  static async updateCard(userId: string, cardId: string, input: UpdateCardInput): Promise<ICard & { id: string }> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    const updateFields: Record<string, any> = {
      clientUpdatedAt: now,
      serverUpdatedAt: now,
    };

    if (input.content !== undefined) updateFields.content = input.content;
    if (input.title !== undefined) updateFields.title = input.title;
    if (input.color !== undefined) updateFields.color = input.color;
    if (input.tags !== undefined) updateFields.tags = input.tags;
    if (input.isPinned !== undefined) updateFields.isPinned = input.isPinned;
    if (input.sourceUrl !== undefined) updateFields.sourceUrl = input.sourceUrl;

    const doc = await CardModel.findOneAndUpdate(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        cardId,
        deletedAt: null,
      },
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!doc) {
      throw new AppError('Card not found', 404);
    }

    return {
      id: doc.cardId,
      cardId: doc.cardId,
      userId: doc.userId,
      content: doc.content,
      title: doc.title,
      color: (doc.color as CardColor) || 'charcoal',
      tags: doc.tags,
      isPinned: !!doc.isPinned,
      sourceUrl: doc.sourceUrl,
      savedAt: doc.savedAt,
      clientUpdatedAt: doc.clientUpdatedAt,
      serverUpdatedAt: doc.serverUpdatedAt,
    };
  }

  /**
   * Toggle pin status of a card
   */
  static async togglePin(userId: string, cardId: string, isPinned?: boolean): Promise<boolean> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    const card = await CardModel.findOne({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      cardId,
      deletedAt: null,
    });

    if (!card) {
      throw new AppError('Card not found', 404);
    }

    const nextPinState = typeof isPinned === 'boolean' ? isPinned : !card.isPinned;
    card.isPinned = nextPinState;
    card.clientUpdatedAt = now;
    card.serverUpdatedAt = now;
    await card.save();

    return nextPinState;
  }

  /**
   * Soft-delete a card by ID
   */
  static async deleteCard(userId: string, cardId: string): Promise<void> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const now = Date.now();

    const result = await CardModel.findOneAndUpdate(
      {
        $or: [{ userId: userObjectId }, { userId: String(userId) }],
        cardId,
      },
      {
        $set: {
          deletedAt: now,
          clientUpdatedAt: now,
          serverUpdatedAt: now,
        },
      }
    );

    if (!result) {
      throw new AppError('Card not found', 404);
    }
  }

  /**
   * Bidirectional delta-sync for cards
   */
  static async deltaSync(
    userId: string,
    lastSyncedTimestamp: number,
    clientChanges: CardChangeInput[]
  ): Promise<{
    serverChanges: (ICard & { id: string })[];
    newSyncTimestamp: number;
  }> {
    const userObjectId = Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId;
    const currentSyncTime = Date.now();

    // 1. Process client changes
    if (clientChanges && clientChanges.length > 0) {
      const bulkOps = clientChanges.map((change) => {
        const isDelete = !!change.deletedAt;

        let title = change.title ? change.title.trim() : '';
        if (!title && change.content) {
          const firstLine = change.content.split('\n')[0].trim();
          title = firstLine.length > 60 ? firstLine.slice(0, 57) + '...' : firstLine;
        }

        if (isDelete) {
          return {
            updateOne: {
              filter: {
                $or: [{ userId: userObjectId }, { userId: String(userId) }],
                cardId: change.id,
              },
              update: {
                $set: {
                  deletedAt: change.deletedAt || currentSyncTime,
                  clientUpdatedAt: change.clientUpdatedAt || currentSyncTime,
                  serverUpdatedAt: currentSyncTime,
                },
              },
              upsert: false,
            },
          };
        }

        return {
          updateOne: {
            filter: {
              $or: [{ userId: userObjectId }, { userId: String(userId) }],
              cardId: change.id,
            },
            update: {
              $set: {
                content: change.content,
                title,
                color: change.color || 'charcoal',
                tags: change.tags || [],
                isPinned: !!change.isPinned,
                sourceUrl: change.sourceUrl || '',
                clientUpdatedAt: change.clientUpdatedAt || currentSyncTime,
                serverUpdatedAt: currentSyncTime,
                deletedAt: null,
              },
              $setOnInsert: {
                cardId: change.id,
                userId: userObjectId,
                savedAt: change.savedAt || currentSyncTime,
              },
            },
            upsert: true,
          },
        };
      });

      await CardModel.bulkWrite(bulkOps);
    }

    // 2. Fetch server changes since lastSyncedTimestamp
    const serverChangesDocs = await CardModel.find({
      $or: [{ userId: userObjectId }, { userId: String(userId) }],
      serverUpdatedAt: { $gt: lastSyncedTimestamp },
    }).lean();

    const serverChanges = serverChangesDocs.map((c) => ({
      id: c.cardId,
      cardId: c.cardId,
      userId: c.userId,
      content: c.content,
      title: c.title,
      color: (c.color as CardColor) || 'charcoal',
      tags: c.tags,
      isPinned: !!c.isPinned,
      sourceUrl: c.sourceUrl,
      savedAt: c.savedAt,
      clientUpdatedAt: c.clientUpdatedAt,
      serverUpdatedAt: c.serverUpdatedAt,
      deletedAt: c.deletedAt,
    }));

    return {
      serverChanges,
      newSyncTimestamp: currentSyncTime,
    };
  }
}
