import { Request, Response, NextFunction } from 'express';
import { MovieService } from '../services/movie.service';
import { CommentService } from '../services/comment.service';

export class MovieController {
  static async getMovies(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.page_size ? parseInt(req.query.page_size as string, 10) : 10;
      const sortBy = (req.query.sort_by as string) || 'updatedAt';
      const sortOrder = ((req.query.sort_order as string) || 'desc') as 'asc' | 'desc';
      const search = req.query.search as string;
      const status = req.query.status as string;
      const director = req.query.director as string;
      const genre = req.query.genre as string;
      const platform = req.query.platform as string;
      const yearMin = req.query.year_min ? parseInt(req.query.year_min as string, 10) : undefined;
      const yearMax = req.query.year_max ? parseInt(req.query.year_max as string, 10) : undefined;
      const ratingMin = req.query.rating_min ? parseFloat(req.query.rating_min as string) : undefined;
      const ratingMax = req.query.rating_max ? parseFloat(req.query.rating_max as string) : undefined;
      const isFavorite = req.query.is_favorite !== undefined ? req.query.is_favorite === 'true' : undefined;
      const isWatchlist = req.query.is_watchlist !== undefined ? req.query.is_watchlist === 'true' : undefined;

      const result = await MovieService.getPaginatedMovies(req.user!.userId, {
        page,
        pageSize,
        sortBy,
        sortOrder,
        search,
        status,
        director,
        genre,
        platform,
        yearMin,
        yearMax,
        ratingMin,
        ratingMax,
        isFavorite,
        isWatchlist,
      });

      res.status(200).json({
        items: result.items,
        total: result.total,
        page: result.page,
        page_size: result.pageSize,
        total_pages: result.totalPages,
        has_next: result.hasNext,
        has_prev: result.hasPrev,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await MovieService.getStats(req.user!.userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async checkExists(req: Request, res: Response, next: NextFunction) {
    try {
      const title = req.query.title as string;
      const result = await MovieService.checkExists(req.user!.userId, title || '');
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await MovieService.createMovieWithSession(req.user!.userId, req.body);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async createWatchlistMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await MovieService.createWatchlistMovie(req.user!.userId, req.body);
      res.status(201).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async getMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await MovieService.getMovieWithSessions(req.user!.userId, req.params.id as string);
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async updateMovie(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await MovieService.updateMovieAndSession(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMovie(req: Request, res: Response, next: NextFunction) {
    try {
      await MovieService.deleteMovie(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const isFavorite = req.body.is_favorite ?? req.body.isFavorite ?? true;
      const movie = await MovieService.toggleFavorite(req.user!.userId, req.params.id as string, isFavorite);
      res.status(200).json({ message: 'Favorite status updated', is_favorite: movie.isFavorite });
    } catch (error) {
      next(error);
    }
  }

  static async toggleWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const isWatchlist = req.body.is_watchlist ?? req.body.isWatchlist ?? true;
      const movie = await MovieService.toggleWatchlist(req.user!.userId, req.params.id as string, isWatchlist);
      res.status(200).json({ message: 'Watchlist status updated', is_watchlist: movie.isWatchlist });
    } catch (error) {
      next(error);
    }
  }

  static async rewatch(req: Request, res: Response, next: NextFunction) {
    try {
      const movie = await MovieService.startRewatch(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(movie);
    } catch (error) {
      next(error);
    }
  }

  static async getMovieSessionsWithComments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await MovieService.getMovieWithSessions(req.user!.userId, req.params.id as string);
      const sessionsWithComments = [];

      for (const s of data.sessions) {
        const comments = await CommentService.getCommentsForItem(req.user!.userId, 'session', s.publicId);
        sessionsWithComments.push({
          session: s,
          comments,
          pause_resume: s.pauseLogs?.length
            ? {
                pause_count: s.pauseLogs.length,
                resume_count: s.pauseLogs.filter(p => p.resumedAt).length,
                first_paused_at: s.pauseLogs[0]?.pausedAt,
                last_resumed_at: s.pauseLogs[s.pauseLogs.length - 1]?.resumedAt,
              }
            : null,
        });
      }

      res.status(200).json({
        movie: data.movie,
        sessions: sessionsWithComments,
        current_session: data.current_session,
        rewatch_count: data.rewatch_count,
      });
    } catch (error) {
      next(error);
    }
  }
}
