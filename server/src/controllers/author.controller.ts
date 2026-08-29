import { Request, Response, NextFunction } from 'express';
import { AuthorService } from '../services/author.service';

export class AuthorController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const authors = await AuthorService.getAll(req.user!.userId);
      res.status(200).json(authors);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const author = await AuthorService.getById(req.user!.userId, req.params.id as string);
      res.status(200).json(author);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const author = await AuthorService.create(req.user!.userId, req.body);
      res.status(201).json(author);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const author = await AuthorService.update(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(author);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthorService.delete(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Author deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
