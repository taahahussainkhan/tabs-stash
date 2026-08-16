import { Request, Response, NextFunction } from 'express';
import { SyncService } from '../services/sync.service';

export class SyncController {
  static async deltaSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lastSyncedTimestamp, clientChanges } = req.body;
      const result = await SyncService.deltaSync(
        req.user!.userId,
        lastSyncedTimestamp || 0,
        clientChanges || []
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await SyncService.getActiveSessions(req.user!.userId);
      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async upsertSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await SyncService.upsertSingleSession(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = req.params.id as string;
      const result = await SyncService.deleteSession(req.user!.userId, sessionId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await SyncService.clearAll(req.user!.userId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
