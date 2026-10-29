import { Request, Response, NextFunction } from 'express';
import { QuickRecordService } from '../services/quick-record.service';

export class QuickRecordController {
  static async listRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeDissolved = req.query.includeDissolved === 'true';
      const withLogs = req.query.withLogs === 'true';
      const data = await QuickRecordService.listRecords(
        req.user!.userId,
        includeDissolved,
        withLogs
      );
      res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async createRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.createRecord(req.user!.userId, req.body);
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async getRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.getRecord(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async updateRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.updateRecord(
        req.user!.userId,
        req.params.id as string,
        req.body
      );
      res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async dissolveRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.dissolveRecord(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Record dissolved', data });
    } catch (e) {
      next(e);
    }
  }

  static async restoreRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.restoreRecord(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, message: 'Record restored', data });
    } catch (e) {
      next(e);
    }
  }

  static async listLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.listLogs(req.user!.userId, req.params.id as string);
      res.status(200).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async addLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await QuickRecordService.addLog(
        req.user!.userId,
        req.params.id as string,
        req.body
      );
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
}
