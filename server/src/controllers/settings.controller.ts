import { Request, Response, NextFunction } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings(req.user!.userId);
      res.status(200).json({
        id: settings._id,
        public_id: settings.publicId,
        user_id: settings.userId,
        card_layout: settings.cardLayout,
        cards_per_row: settings.cardsPerRow,
        card_size: settings.cardSize,
        dashboard_widgets: settings.dashboardWidgets,
        dashboard_order: settings.dashboardOrder,
        theme: settings.theme,
        accent_color: settings.accentColor,
        font_size: settings.fontSize,
        density: settings.density,
        default_sort: settings.defaultSort,
        default_filters: settings.defaultFilters,
        items_per_page: settings.itemsPerPage,
        date_format: settings.dateFormat,
        time_format: settings.timeFormat,
        max_concurrent_watching_movies: settings.maxConcurrentWatchingMovies,
        max_concurrent_watching_series: settings.maxConcurrentWatchingSeries,
        created_at: settings.createdAt,
        updated_at: settings.updatedAt,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await SettingsService.updateSettings(req.user!.userId, req.body);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await SettingsService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getCategoriesByGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await SettingsService.getCategoriesByGroup(req.params.group as string);
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getUserPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const prefs = await SettingsService.getUserPreferences(req.user!.userId);
      res.status(200).json(prefs);
    } catch (error) {
      next(error);
    }
  }

  static async createOrUpdatePreference(req: Request, res: Response, next: NextFunction) {
    try {
      const pref = await SettingsService.createOrUpdatePreference(
        req.user!.userId,
        req.body.categoryId,
        req.body.isEnabled
      );
      res.status(200).json(pref);
    } catch (error) {
      next(error);
    }
  }

  static async deletePreference(req: Request, res: Response, next: NextFunction) {
    try {
      await SettingsService.deletePreference(req.user!.userId, req.params.categoryId as string);
      res.status(200).json({ message: 'Preference deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
