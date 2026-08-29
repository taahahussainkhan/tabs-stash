import { BookWorkModel, BookEditionModel, BookItemModel, IBookWork, IBookEdition, IBookItem } from '../models/book.model';
import { AuthorModel } from '../models/author.model';
import { GenreModel } from '../models/genre.model';
import { PublisherModel } from '../models/publisher.model';
import { StoreModel } from '../models/store.model';
import { MediaSessionModel, IMediaSession } from '../models/media-session.model';
import { CommentModel } from '../models/comment.model';
import { ActivityLogModel } from '../models/activity-log.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

export class BookService {
  static async getPaginatedBooks(userId: string, options: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    ownershipStatus?: string;
    format?: string;
    language?: string;
    author?: string;
    publisher?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));
    const skip = (page - 1) * pageSize;
    const uId = new Types.ObjectId(userId);

    const filter: any = { userId: uId };
    if (options.ownershipStatus) filter.ownershipStatus = options.ownershipStatus;

    const total = await BookItemModel.countDocuments(filter);
    const items = await BookItemModel.find(filter)
      .populate({
        path: 'editionId',
        populate: [
          { path: 'publisherId' },
          {
            path: 'bookId',
            populate: [{ path: 'authors' }, { path: 'genres' }, { path: 'tags' }],
          },
        ],
      })
      .populate('storeId')
      .populate('currentSessionId')
      .sort({ [options.sortBy || 'createdAt']: options.sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(pageSize);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  static async getStats(userId: string) {
    const uId = new Types.ObjectId(userId);
    const total = await BookItemModel.countDocuments({ userId: uId });
    const owned = await BookItemModel.countDocuments({ userId: uId, ownershipStatus: 'Owned' });
    const wishlist = await BookItemModel.countDocuments({ userId: uId, ownershipStatus: 'Wishlist' });
    const lent = await BookItemModel.countDocuments({ userId: uId, isLent: true });

    const reading = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'book',
      status: 'reading',
    });

    const completed = await MediaSessionModel.countDocuments({
      userId: uId,
      mediaType: 'book',
      status: 'completed',
    });

    return {
      total,
      owned,
      wishlist,
      lent,
      reading,
      completed,
    };
  }

  static async getBookDetails(userId: string, publicId: string) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({
      userId: uId,
      publicId,
    })
      .populate({
        path: 'editionId',
        populate: [
          { path: 'publisherId' },
          {
            path: 'bookId',
            populate: [{ path: 'authors' }, { path: 'genres' }, { path: 'tags' }, { path: 'linkedTabSessions' }],
          },
        ],
      })
      .populate('storeId')
      .populate('currentSessionId');

    if (!item) {
      throw new AppError('Book not found', 404);
    }

    const sessions = await MediaSessionModel.find({
      userId: uId,
      mediaType: 'book',
      mediaId: item._id,
    }).sort({ startDate: -1 });

    const comments = await CommentModel.find({
      userId: uId,
      loggableType: 'book',
      loggableId: item._id,
    }).sort({ createdAt: 1 });

    return {
      item,
      sessions,
      comments,
    };
  }

  static async createBook(userId: string, data: any) {
    const uId = new Types.ObjectId(userId);

    // 1. Resolve / Create Authors
    const authorIds: Types.ObjectId[] = [];
    if (data.authors && Array.isArray(data.authors)) {
      for (const auth of data.authors) {
        if (Types.ObjectId.isValid(auth)) {
          authorIds.push(new Types.ObjectId(auth));
        } else if (typeof auth === 'string' && auth.trim()) {
          let found = await AuthorModel.findOne({
            $or: [{ userId: uId }, { isPredefined: true }],
            name: new RegExp(`^${auth.trim()}$`, 'i'),
          });
          if (!found) {
            found = await AuthorModel.create({
              userId: uId,
              name: auth.trim(),
            });
          }
          authorIds.push(found._id);
        }
      }
    }

    // 2. Resolve / Create Genres
    const genreIds: Types.ObjectId[] = [];
    if (data.genres && Array.isArray(data.genres)) {
      for (const g of data.genres) {
        if (Types.ObjectId.isValid(g)) {
          genreIds.push(new Types.ObjectId(g));
        } else if (typeof g === 'string' && g.trim()) {
          const slug = g.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
          let found = await GenreModel.findOne({
            $or: [{ userId: uId }, { userId: null }],
            slug,
          });
          if (!found) {
            found = await GenreModel.create({
              userId: uId,
              name: g.trim(),
              slug,
            });
          }
          genreIds.push(found._id);
        }
      }
    }

    // 3. Resolve / Create Publisher
    let publisherId: Types.ObjectId | null = null;
    if (data.publisherName && typeof data.publisherName === 'string') {
      let pub = await PublisherModel.findOne({
        $or: [{ userId: uId }, { isPredefined: true }],
        name: new RegExp(`^${data.publisherName.trim()}$`, 'i'),
      });
      if (!pub) {
        pub = await PublisherModel.create({
          userId: uId,
          name: data.publisherName.trim(),
        });
      }
      publisherId = pub._id;
    }

    // 4. Resolve / Create Store
    let storeId: Types.ObjectId | null = null;
    if (data.storeName && typeof data.storeName === 'string') {
      let store = await StoreModel.findOne({
        userId: uId,
        name: new RegExp(`^${data.storeName.trim()}$`, 'i'),
      });
      if (!store) {
        store = await StoreModel.create({
          userId: uId,
          name: data.storeName.trim(),
          type: data.storeType || 'Hybrid',
        });
      }
      storeId = store._id;
    }

    // 5. Create BookWork
    const bookWork = await BookWorkModel.create({
      userId: uId,
      title: data.title,
      subtitle: data.subtitle || null,
      originalYear: data.originalYear || null,
      seriesName: data.seriesName || null,
      seriesPosition: data.seriesPosition || null,
      description: data.description || null,
      authors: authorIds,
      genres: genreIds,
      tags: data.tags || [],
      linkedTabSessions: data.linkedTabSessions || [],
    });

    // 6. Create BookEdition
    const bookEdition = await BookEditionModel.create({
      userId: uId,
      bookId: bookWork._id,
      publisherId,
      isbn: data.isbn || null,
      isbn13: data.isbn13 || null,
      publishYear: data.publishYear || null,
      pageCount: data.pageCount || null,
      coverImage: data.coverImage || null,
      language: data.language || 'English',
      originalLanguage: data.originalLanguage || null,
      isTranslated: data.isTranslated || false,
      translator: data.translator || null,
      translatorNotes: data.translatorNotes || null,
      format: data.format || 'Paperback',
      editionNumber: data.editionNumber || null,
      editionNotes: data.editionNotes || null,
    });

    // 7. Create BookItem
    const bookItem = await BookItemModel.create({
      userId: uId,
      editionId: bookEdition._id,
      storeId,
      purchaseChannel: data.purchaseChannel || null,
      orderPlacedDate: data.orderPlacedDate ? new Date(data.orderPlacedDate) : null,
      orderReceivedDate: data.orderReceivedDate ? new Date(data.orderReceivedDate) : null,
      paymentMethod: data.paymentMethod || null,
      paymentPlatform: data.paymentPlatform || null,
      purchaseCurrency: data.purchaseCurrency || 'USD',
      listPrice: data.listPrice || null,
      paidPrice: data.paidPrice || null,
      discountInfo: data.discountInfo || null,
      condition: data.condition || 'Good',
      isPirated: data.isPirated || false,
      isSigned: data.isSigned || false,
      signedBy: data.signedBy || null,
      dedication: data.dedication || null,
      ownershipStatus: data.ownershipStatus || 'Owned',
      isLent: data.isLent || false,
      lentTo: data.lentTo || null,
      lentDate: data.lentDate ? new Date(data.lentDate) : null,
      expectedReturnDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
      personalNotes: data.personalNotes || null,
      acquisitionStory: data.acquisitionStory || null,
    });

    await ActivityLogModel.create({
      userId: uId,
      entityType: 'book',
      entityId: bookItem.publicId,
      action: 'created',
      summary: `Added book "${bookWork.title}" to library (${bookItem.ownershipStatus})`,
    });

    return this.getBookDetails(userId, bookItem.publicId);
  }

  static async updateBook(userId: string, publicId: string, data: any) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({ userId: uId, publicId });
    if (!item) throw new AppError('Book not found', 404);

    if (data.ownershipStatus !== undefined) item.ownershipStatus = data.ownershipStatus;
    if (data.condition !== undefined) item.condition = data.condition;
    if (data.isPirated !== undefined) item.isPirated = data.isPirated;
    if (data.isSigned !== undefined) item.isSigned = data.isSigned;
    if (data.signedBy !== undefined) item.signedBy = data.signedBy;
    if (data.dedication !== undefined) item.dedication = data.dedication;
    if (data.orderPlacedDate !== undefined) item.orderPlacedDate = data.orderPlacedDate ? new Date(data.orderPlacedDate) : null;
    if (data.orderReceivedDate !== undefined) item.orderReceivedDate = data.orderReceivedDate ? new Date(data.orderReceivedDate) : null;
    if (data.paymentMethod !== undefined) item.paymentMethod = data.paymentMethod;
    if (data.paymentPlatform !== undefined) item.paymentPlatform = data.paymentPlatform;
    if (data.purchaseCurrency !== undefined) item.purchaseCurrency = data.purchaseCurrency;
    if (data.listPrice !== undefined) item.listPrice = data.listPrice;
    if (data.paidPrice !== undefined) item.paidPrice = data.paidPrice;
    if (data.discountInfo !== undefined) item.discountInfo = data.discountInfo;
    if (data.personalNotes !== undefined) item.personalNotes = data.personalNotes;
    if (data.acquisitionStory !== undefined) item.acquisitionStory = data.acquisitionStory;

    await item.save();
    return this.getBookDetails(userId, publicId);
  }

  static async startReading(userId: string, itemPublicId: string) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({ userId: uId, publicId: itemPublicId });
    if (!item) throw new AppError('Book not found', 404);

    const session = await MediaSessionModel.create({
      userId: uId,
      mediaType: 'book',
      mediaId: item._id,
      status: 'reading',
      startDate: new Date(),
      currentPosition: 1,
    });

    item.currentSessionId = session._id;
    await item.save();

    return { sessionId: session.publicId, status: session.status };
  }

  static async updateProgress(userId: string, sessionPublicId: string, page: number) {
    const uId = new Types.ObjectId(userId);
    const session = await MediaSessionModel.findOne({
      userId: uId,
      publicId: sessionPublicId,
      mediaType: 'book',
    });

    if (!session) throw new AppError('Reading session not found', 404);

    session.currentPosition = page;
    await session.save();

    return { current_position: session.currentPosition, updated_at: session.updatedAt };
  }

  static async lendBook(userId: string, itemPublicId: string, lentTo: string, returnDate?: string | null) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({ userId: uId, publicId: itemPublicId });
    if (!item) throw new AppError('Book not found', 404);

    item.isLent = true;
    item.lentTo = lentTo;
    item.lentDate = new Date();
    item.expectedReturnDate = returnDate ? new Date(returnDate) : null;
    await item.save();

    return { status: 'lent', lent_to: item.lentTo };
  }

  static async returnBook(userId: string, itemPublicId: string) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({ userId: uId, publicId: itemPublicId });
    if (!item) throw new AppError('Book not found', 404);

    item.isLent = false;
    item.lentTo = null;
    item.lentDate = null;
    item.expectedReturnDate = null;
    await item.save();

    return { status: 'returned' };
  }

  static async deleteBook(userId: string, publicId: string) {
    const uId = new Types.ObjectId(userId);
    const item = await BookItemModel.findOne({ userId: uId, publicId });
    if (!item) throw new AppError('Book not found', 404);

    await MediaSessionModel.deleteMany({ mediaType: 'book', mediaId: item._id });
    await CommentModel.deleteMany({ loggableType: 'book', loggableId: item._id });
    await BookItemModel.deleteOne({ _id: item._id });
  }
}
