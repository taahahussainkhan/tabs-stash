import { Request, Response, NextFunction } from 'express';
import { LinkService } from '../services/link.service';

export class LinkController {
  static async getLinks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const links = await LinkService.getActiveLinks(req.user!.userId);
      res.status(200).json({
        success: true,
        data: links,
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const link = await LinkService.saveLink(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: link,
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const linkId = req.params.id as string;
      const { isRead } = req.body;
      await LinkService.toggleLinkRead(req.user!.userId, linkId, !!isRead);
      res.status(200).json({
        success: true,
        message: 'Link read status updated',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteLink(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const linkId = req.params.id as string;
      await LinkService.deleteLink(req.user!.userId, linkId);
      res.status(200).json({
        success: true,
        message: 'Link deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deltaSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lastSyncedTimestamp, clientChanges } = req.body;
      const result = await LinkService.deltaSync(
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
}
