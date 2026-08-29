import { Request, Response, NextFunction } from 'express';
import { SeriesService } from '../services/series.service';
import { CommentService } from '../services/comment.service';

export class SeriesController {
  static async getSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.page_size ? parseInt(req.query.page_size as string, 10) : 10;
      const sortBy = (req.query.sort_by as string) || 'updatedAt';
      const sortOrder = ((req.query.sort_order as string) || 'desc') as 'asc' | 'desc';
      const search = req.query.search as string;
      const status = req.query.status as string;
      const creator = req.query.creator as string;
      const genre = req.query.genre as string;
      const platform = req.query.platform as string;
      const yearMin = req.query.year_min ? parseInt(req.query.year_min as string, 10) : undefined;
      const yearMax = req.query.year_max ? parseInt(req.query.year_max as string, 10) : undefined;
      const isFavorite = req.query.is_favorite !== undefined ? req.query.is_favorite === 'true' : undefined;
      const isWatchlist = req.query.is_watchlist !== undefined ? req.query.is_watchlist === 'true' : undefined;

      const result = await SeriesService.getPaginatedSeries(req.user!.userId, {
        page,
        pageSize,
        sortBy,
        sortOrder,
        search,
        status,
        creator,
        genre,
        platform,
        yearMin,
        yearMax,
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
      const stats = await SeriesService.getStats(req.user!.userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  static async checkExists(req: Request, res: Response, next: NextFunction) {
    try {
      const title = req.query.title as string;
      const result = await SeriesService.checkExists(req.user!.userId, title || '');
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const series = await SeriesService.createSeries(req.user!.userId, req.body);
      res.status(201).json(series);
    } catch (error) {
      next(error);
    }
  }

  static async getSeriesById(req: Request, res: Response, next: NextFunction) {
    try {
      const series = await SeriesService.getSeriesWithSessions(req.user!.userId, req.params.id as string);
      res.status(200).json(series);
    } catch (error) {
      next(error);
    }
  }

  static async updateSeries(req: Request, res: Response, next: NextFunction) {
    try {
      const series = await SeriesService.updateSeries(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(series);
    } catch (error) {
      next(error);
    }
  }

  static async deleteSeries(req: Request, res: Response, next: NextFunction) {
    try {
      await SeriesService.deleteSeries(req.user!.userId, req.params.id as string);
      res.status(200).json({ message: 'Series deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getSeasons(req: Request, res: Response, next: NextFunction) {
    try {
      const seasons = await SeriesService.getSeasons(req.user!.userId, req.params.seriesPublicId as string);
      res.status(200).json(seasons);
    } catch (error) {
      next(error);
    }
  }

  static async createSeason(req: Request, res: Response, next: NextFunction) {
    try {
      const season = await SeriesService.createSeason(req.user!.userId, req.params.seriesPublicId as string, req.body);
      res.status(201).json(season);
    } catch (error) {
      next(error);
    }
  }

  static async getEpisodes(req: Request, res: Response, next: NextFunction) {
    try {
      const episodes = await SeriesService.getEpisodes(req.user!.userId, req.params.seasonPublicId as string);
      res.status(200).json(episodes);
    } catch (error) {
      next(error);
    }
  }

  static async createEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const episode = await SeriesService.createEpisode(req.user!.userId, req.params.seasonPublicId as string, req.body);
      res.status(201).json(episode);
    } catch (error) {
      next(error);
    }
  }

  static async markEpisodeWatched(req: Request, res: Response, next: NextFunction) {
    try {
      const isWatched = req.query.is_watched !== undefined ? req.query.is_watched === 'true' : (req.body.is_watched ?? true);
      const result = await SeriesService.markEpisodeWatched(req.user!.userId, req.params.episodePublicId as string, isWatched);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async updateEpisode(req: Request, res: Response, next: NextFunction) {
    try {
      const episode = await SeriesService.updateEpisode(
        req.user!.userId,
        (req.params.seriesPublicId || req.params.id) as string,
        req.params.episodePublicId as string,
        req.body
      );
      res.status(200).json(episode);
    } catch (error) {
      next(error);
    }
  }

  static async getNextUnwatched(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SeriesService.getNextUnwatched(req.user!.userId, req.params.seriesPublicId as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const isFavorite = req.body.is_favorite ?? req.body.isFavorite ?? true;
      const series = await SeriesService.toggleFavorite(req.user!.userId, req.params.id as string, isFavorite);
      res.status(200).json({ message: 'Favorite status updated', is_favorite: series.isFavorite });
    } catch (error) {
      next(error);
    }
  }

  static async toggleWatchlist(req: Request, res: Response, next: NextFunction) {
    try {
      const isWatchlist = req.body.is_watchlist ?? req.body.isWatchlist ?? true;
      const series = await SeriesService.toggleWatchlist(req.user!.userId, req.params.id as string, isWatchlist);
      res.status(200).json({ message: 'Watchlist status updated', is_watchlist: series.isWatchlist });
    } catch (error) {
      next(error);
    }
  }

  static async rewatch(req: Request, res: Response, next: NextFunction) {
    try {
      const series = await SeriesService.startRewatch(req.user!.userId, req.params.id as string, req.body);
      res.status(200).json(series);
    } catch (error) {
      next(error);
    }
  }

  static async getSeriesSessionsWithComments(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SeriesService.getSeriesWithSessions(req.user!.userId, req.params.id as string);
      const sessionsWithComments = [];

      for (const s of data.sessions) {
        const comments = await CommentService.getCommentsForItem(req.user!.userId, 'session', s.publicId);
        sessionsWithComments.push({
          session: s,
          comments,
        });
      }

      res.status(200).json({
        series: data.series,
        sessions: sessionsWithComments,
        current_session: data.current_session,
      });
    } catch (error) {
      next(error);
    }
  }
}
