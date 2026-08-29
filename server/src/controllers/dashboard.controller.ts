import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getDashboardData(req.user!.userId);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getDashboardStats(req.user!.userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const results = await DashboardService.globalSearch(req.user!.userId, query);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }
}
