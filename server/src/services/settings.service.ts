import { UserSettingsModel, IUserSettings, LoggingCategoryModel, ILoggingCategory, UserPreferenceModel, IUserPreference } from '../models/settings.model';
import { AppError } from '../middlewares/error.middleware';
import { Types } from 'mongoose';

const DEFAULT_CATEGORIES = [
  { name: 'movies', displayName: 'Movies', categoryGroup: 'entertainment', icon: 'Film', description: 'Track watched films' },
  { name: 'series', displayName: 'TV Series', categoryGroup: 'entertainment', icon: 'Tv', description: 'Track seasons and episodes' },
  { name: 'documentaries', displayName: 'Documentaries', categoryGroup: 'entertainment', icon: 'FileText', description: 'Track documentary films' },
  { name: 'books', displayName: 'Books', categoryGroup: 'reading', icon: 'Book', description: 'Track reading progress and library' },
  { name: 'magazines', displayName: 'Magazines', categoryGroup: 'reading', icon: 'BookOpen', description: 'Track subscriptions and issues' },
];

export class SettingsService {
  static async getSettings(userId: string): Promise<IUserSettings> {
    let settings = await UserSettingsModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!settings) {
      settings = await UserSettingsModel.create({ userId: new Types.ObjectId(userId) });
    }
    return settings;
  }

  static async updateSettings(userId: string, updateData: Partial<IUserSettings>): Promise<IUserSettings> {
    let settings = await UserSettingsModel.findOne({ userId: new Types.ObjectId(userId) });
    if (!settings) {
      settings = new UserSettingsModel({ userId: new Types.ObjectId(userId), ...updateData });
    } else {
      Object.assign(settings, updateData);
    }
    return settings.save();
  }

  static async ensureDefaultCategories(): Promise<void> {
    for (const cat of DEFAULT_CATEGORIES) {
      const exists = await LoggingCategoryModel.findOne({ name: cat.name });
      if (!exists) {
        await LoggingCategoryModel.create(cat);
      }
    }
  }

  static async getAllCategories(): Promise<ILoggingCategory[]> {
    await this.ensureDefaultCategories();
    return LoggingCategoryModel.find({ isActive: true }).sort({ categoryGroup: 1, name: 1 });
  }

  static async getCategoriesByGroup(group: string): Promise<ILoggingCategory[]> {
    await this.ensureDefaultCategories();
    return LoggingCategoryModel.find({ categoryGroup: group, isActive: true });
  }

  static async getUserPreferences(userId: string): Promise<IUserPreference[]> {
    return UserPreferenceModel.find({ userId: new Types.ObjectId(userId) }).populate('categoryId');
  }

  static async createOrUpdatePreference(userId: string, categoryIdOrPublicId: string, isEnabled: boolean): Promise<IUserPreference> {
    let cat = await LoggingCategoryModel.findOne({
      $or: [
        { _id: Types.ObjectId.isValid(categoryIdOrPublicId) ? new Types.ObjectId(categoryIdOrPublicId) : null },
        { publicId: categoryIdOrPublicId },
        { name: categoryIdOrPublicId },
      ].filter(Boolean),
    });

    if (!cat) {
      throw new AppError('Category not found', 404);
    }

    let pref = await UserPreferenceModel.findOne({
      userId: new Types.ObjectId(userId),
      categoryId: cat._id,
    });

    if (!pref) {
      pref = new UserPreferenceModel({
        userId: new Types.ObjectId(userId),
        categoryId: cat._id,
        isEnabled,
      });
    } else {
      pref.isEnabled = isEnabled;
    }

    return pref.save();
  }

  static async deletePreference(userId: string, categoryIdOrPublicId: string): Promise<void> {
    let cat = await LoggingCategoryModel.findOne({
      $or: [
        { _id: Types.ObjectId.isValid(categoryIdOrPublicId) ? new Types.ObjectId(categoryIdOrPublicId) : null },
        { publicId: categoryIdOrPublicId },
      ].filter(Boolean),
    });

    if (!cat) {
      throw new AppError('Category not found', 404);
    }

    const res = await UserPreferenceModel.deleteOne({
      userId: new Types.ObjectId(userId),
      categoryId: cat._id,
    });

    if (res.deletedCount === 0) {
      throw new AppError('Preference not found', 404);
    }
  }
}
