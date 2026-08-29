import { Request, Response, NextFunction } from 'express';
import { BookService } from '../services/book.service';

export class BookController {
  static async getBooks(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.page_size ? parseInt(req.query.page_size as string, 10) : 20;
      const search = req.query.search as string;
      const sortBy = (req.query.sort_by as string) || 'createdAt';
      const sortOrder = ((req.query.sort_order as string) || 'desc') as 'asc' | 'desc';
      const ownershipStatus = req.query.ownership_status as string;
      const format = req.query.format as string;
      const language = req.query.language as string;
      const author = req.query.author as string;
      const publisher = req.query.publisher as string;

      const result = await BookService.getPaginatedBooks(req.user!.userId, {
        page,
        pageSize,
        search,
        sortBy,
        sortOrder,
        ownershipStatus,
        format,
        language,
        author,
        publisher,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await BookService.getStats(req.user!.userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async getBookDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await BookService.getBookDetails(req.user!.userId, req.params.id as string);
      res.status(200).json(details);
    } catch (error) {
      next(error);
    }
  }

  static async createBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.createBook(req.user!.userId, req.body);
      res.status(201).json(book);
    } catch (error) {
      next(error);
    }
  }

  static async updateBook(req: Request, res: Response, next: NextFunction) {
    try {
      const book = await BookService.updateBook(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(book);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBook(req: Request, res: Response, next: NextFunction) {
    try {
      await BookService.deleteBook(req.user!.userId, req.params.id as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async startReading(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.startReading(req.user!.userId, req.params.id as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.updateProgress(req.user!.userId, req.params.id as string, req.body.page);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async lendBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.lendBook(
        req.user!.userId,
        req.params.id as string,
        req.body.lentTo,
        req.body.expectedReturnDate
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async returnBook(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookService.returnBook(req.user!.userId, req.params.id as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
