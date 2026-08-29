import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

// 1. The Work (Abstract Book, e.g. "Dune")
export interface IBookWork extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  title: string;
  subtitle?: string | null;
  originalYear?: number | null;
  seriesName?: string | null;
  seriesPosition?: number | null;
  description?: string | null;
  authors: Types.ObjectId[];
  genres: Types.ObjectId[];
  tags: Types.ObjectId[];
  linkedTabSessions: Types.ObjectId[];
  referenceUrls: Array<{ title: string; url: string; icon?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

// 2. The Edition (Specific Publication, e.g. "1999 Ace Paperback")
export interface IBookEdition extends Document {
  _id: Types.ObjectId;
  publicId: string;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  publisherId?: Types.ObjectId | null;
  isbn?: string | null;
  isbn13?: string | null;
  publishYear?: number | null;
  pageCount?: number | null;
  coverImage?: string | null;
  language?: string | null;
  originalLanguage?: string | null;
  isTranslated: boolean;
  translator?: string | null;
  translatorNotes?: string | null;
  format: 'Paperback' | 'Hardcover' | 'E-book' | 'Audiobook' | 'Mass Market';
  editionNumber?: number | null;
  editionNotes?: string | null;
  dimensions?: string | null;
  weight?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 3. The Item / Copy (Physical or digital inventory item)
export interface IBookItem extends Document {
  _id: Types.ObjectId;
  publicId: string;
  editionId: Types.ObjectId;
  userId: Types.ObjectId;
  storeId?: Types.ObjectId | null;
  purchaseChannel?: string | null;
  orderPlacedDate?: Date | null;
  orderReceivedDate?: Date | null;
  paymentMethod?: string | null;
  paymentPlatform?: string | null;
  purchaseCurrency: string;
  listPrice?: number | null;
  paidPrice?: number | null;
  discountInfo?: string | null;
  condition?: string | null;
  isPirated: boolean;
  isSigned: boolean;
  signedBy?: string | null;
  dedication?: string | null;
  ownershipStatus: 'Owned' | 'Wishlist' | 'Sold' | 'Lent' | 'Donated';
  isLent: boolean;
  lentTo?: string | null;
  lentDate?: Date | null;
  expectedReturnDate?: Date | null;
  personalNotes?: string | null;
  acquisitionStory?: string | null;
  currentSessionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const BookWorkSchema = new Schema<IBookWork>(
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
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtitle: {
      type: String,
      default: null,
    },
    originalYear: {
      type: Number,
      default: null,
    },
    seriesName: {
      type: String,
      default: null,
    },
    seriesPosition: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    authors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Author',
      },
    ],
    genres: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    linkedTabSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'StashedSession',
      },
    ],
    referenceUrls: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const BookEditionSchema = new Schema<IBookEdition>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'BookWork',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    publisherId: {
      type: Schema.Types.ObjectId,
      ref: 'Publisher',
      default: null,
    },
    isbn: {
      type: String,
      default: null,
      index: true,
    },
    isbn13: {
      type: String,
      default: null,
      index: true,
    },
    publishYear: {
      type: Number,
      default: null,
    },
    pageCount: {
      type: Number,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    language: {
      type: String,
      default: 'English',
    },
    originalLanguage: {
      type: String,
      default: null,
    },
    isTranslated: {
      type: Boolean,
      default: false,
    },
    translator: {
      type: String,
      default: null,
    },
    translatorNotes: {
      type: String,
      default: null,
    },
    format: {
      type: String,
      enum: ['Paperback', 'Hardcover', 'E-book', 'Audiobook', 'Mass Market'],
      default: 'Paperback',
    },
    editionNumber: {
      type: Number,
      default: null,
    },
    editionNotes: {
      type: String,
      default: null,
    },
    dimensions: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const BookItemSchema = new Schema<IBookItem>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    editionId: {
      type: Schema.Types.ObjectId,
      ref: 'BookEdition',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: 'Store',
      default: null,
    },
    purchaseChannel: {
      type: String,
      default: null,
    },
    orderPlacedDate: {
      type: Date,
      default: null,
    },
    orderReceivedDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    paymentPlatform: {
      type: String,
      default: null,
    },
    purchaseCurrency: {
      type: String,
      default: 'USD',
    },
    listPrice: {
      type: Number,
      default: null,
    },
    paidPrice: {
      type: Number,
      default: null,
    },
    discountInfo: {
      type: String,
      default: null,
    },
    condition: {
      type: String,
      default: 'Good',
    },
    isPirated: {
      type: Boolean,
      default: false,
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
    signedBy: {
      type: String,
      default: null,
    },
    dedication: {
      type: String,
      default: null,
    },
    ownershipStatus: {
      type: String,
      enum: ['Owned', 'Wishlist', 'Sold', 'Lent', 'Donated'],
      default: 'Owned',
      index: true,
    },
    isLent: {
      type: Boolean,
      default: false,
    },
    lentTo: {
      type: String,
      default: null,
    },
    lentDate: {
      type: Date,
      default: null,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    personalNotes: {
      type: String,
      default: null,
    },
    acquisitionStory: {
      type: String,
      default: null,
    },
    currentSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaSession',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

BookWorkSchema.index({ userId: 1, title: 1 });
BookItemSchema.index({ userId: 1, ownershipStatus: 1, updatedAt: -1 });

export const BookWorkModel = model<IBookWork>('BookWork', BookWorkSchema);
export const BookEditionModel = model<IBookEdition>('BookEdition', BookEditionSchema);
export const BookItemModel = model<IBookItem>('BookItem', BookItemSchema);
