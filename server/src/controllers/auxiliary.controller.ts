import { Request, Response, NextFunction } from 'express';
import { GenreService, PublisherService, StoreService } from '../services/auxiliary.service';

export class GenreController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const genres = await GenreService.getAll(req.user!.userId);
      res.status(200).json(genres);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const genre = await GenreService.create(req.user!.userId, req.body);
      res.status(201).json(genre);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await GenreService.delete(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Genre deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export class PublisherController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const pubs = await PublisherService.getAll(req.user!.userId);
      res.status(200).json(pubs);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const pub = await PublisherService.create(req.user!.userId, req.body);
      res.status(201).json(pub);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const pub = await PublisherService.update(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(pub);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await PublisherService.delete(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Publisher deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export class StoreController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await StoreService.getAll(req.user!.userId);
      res.status(200).json(stores);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.create(req.user!.userId, req.body);
      res.status(201).json(store);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await StoreService.update(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(store);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await StoreService.delete(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
