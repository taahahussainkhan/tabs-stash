import { Request, Response, NextFunction } from 'express';
import { CardService } from '../services/card.service';

export class CardController {
  static async getCards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cards = await CardService.getActiveCards(req.user!.userId);
      res.status(200).json({
        success: true,
        data: cards,
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const card = await CardService.saveCard(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: card,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const card = await CardService.updateCard(req.user!.userId, cardId, req.body);
      res.status(200).json({
        success: true,
        data: card,
      });
    } catch (error) {
      next(error);
    }
  }

  static async togglePin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const { isPinned } = req.body;
      const newPinState = await CardService.togglePin(req.user!.userId, cardId, isPinned);
      res.status(200).json({
        success: true,
        message: newPinState ? 'Card pinned' : 'Card unpinned',
        data: { isPinned: newPinState },
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cardId = req.params.id as string;
      await CardService.deleteCard(req.user!.userId, cardId);
      res.status(200).json({
        success: true,
        message: 'Card deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async deltaSync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { lastSyncedTimestamp, clientChanges } = req.body;
      const result = await CardService.deltaSync(
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
