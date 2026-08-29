import { Schema, model, Document, Types } from 'mongoose';
import { randomUUID } from 'crypto';

export interface ILoggingCategory extends Document {
  _id: Types.ObjectId;
  publicId: string;
  name: string;
  displayName: string;
  categoryGroup: 'entertainment' | 'reading' | 'work';
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface IUserPreference extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  categoryId: Types.ObjectId;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserSettings extends Document {
  _id: Types.ObjectId;
  publicId: string;
  userId: Types.ObjectId;
  
  // Card layout preferences
  cardLayout: 'grid' | 'list' | 'compact';
  cardsPerRow?: number | null;
  cardSize: 'small' | 'medium' | 'large';

  // Dashboard preferences
  dashboardWidgets?: Record<string, boolean>;
  dashboardOrder?: string[];

  // Display preferences
  theme: 'light' | 'dark' | 'auto';
  accentColor?: string | null;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  density: 'compact' | 'comfortable' | 'spacious';

  // Sorting & filtering defaults
  defaultSort?: Record<string, string>;
  defaultFilters?: Record<string, any>;

  // Pagination & limits
  itemsPerPage: number;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  maxConcurrentWatchingMovies?: number | null;
  maxConcurrentWatchingSeries?: number | null;

  createdAt: Date;
  updatedAt: Date;
}

const LoggingCategorySchema = new Schema<ILoggingCategory>(
  {
    publicId: {
      type: String,
      required: true,
      default: () => randomUUID(),
      index: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    categoryGroup: {
      type: String,
      enum: ['entertainment', 'reading', 'work'],
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const UserPreferenceSchema = new Schema<IUserPreference>(
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'LoggingCategory',
      required: true,
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

UserPreferenceSchema.index({ userId: 1, categoryId: 1 }, { unique: true });

const UserSettingsSchema = new Schema<IUserSettings>(
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
      unique: true,
      index: true,
    },
    cardLayout: {
      type: String,
      enum: ['grid', 'list', 'compact'],
      default: 'grid',
    },
    cardsPerRow: {
      type: Number,
      default: 4,
    },
    cardSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    dashboardWidgets: {
      type: Schema.Types.Mixed,
      default: () => ({
        continueWatching: true,
        recentlyCompleted: true,
        watchlist: true,
        stats: true,
        tabVault: true,
      }),
    },
    dashboardOrder: {
      type: [String],
      default: () => ['stats', 'continueWatching', 'recentlyCompleted', 'watchlist', 'tabVault'],
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark',
    },
    accentColor: {
      type: String,
      default: '#e05a47',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium',
    },
    density: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable',
    },
    defaultSort: {
      type: Schema.Types.Mixed,
      default: () => ({ movies: 'updatedAt', series: 'updatedAt', books: 'createdAt' }),
    },
    defaultFilters: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    itemsPerPage: {
      type: Number,
      default: 25,
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h',
    },
    maxConcurrentWatchingMovies: {
      type: Number,
      default: null,
    },
    maxConcurrentWatchingSeries: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const LoggingCategoryModel = model<ILoggingCategory>('LoggingCategory', LoggingCategorySchema);
export const UserPreferenceModel = model<IUserPreference>('UserPreference', UserPreferenceSchema);
export const UserSettingsModel = model<IUserSettings>('UserSettings', UserSettingsSchema);
