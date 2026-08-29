import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';

export class CommentController {
  static async getSessionComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.getCommentsForItem(
        req.user!.userId,
        'session',
        req.params.id as string
      );
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  static async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.createComment(req.user!.userId, {
        loggableType: (req.body.loggableType || 'session') as any,
        loggableId: (req.body.loggableId || req.params.id) as string,
        content: req.body.content,
        timestamp: req.body.timestamp,
        chapterOrEpisode: req.body.chapterOrEpisode,
        isSpoiler: req.body.isSpoiler,
      });
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  static async replaceSessionComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await CommentService.replaceSessionComments(
        req.user!.userId,
        req.params.id as string,
        req.body
      );
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  }

  static async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await CommentService.updateComment(
        req.user!.userId,
        req.params.id as string,
        req.body
      );
      res.status(200).json(comment);
    } catch (error) {
      next(error);
    }
  }

  static async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      await CommentService.deleteComment(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
