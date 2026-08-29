import { Router } from 'express';
import { SeriesController } from '../controllers/series.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createSeriesSchema,
  updateSeriesSchema,
} from '../validators/series.schema';
import { toggleFlagSchema, rewatchMovieSchema } from '../validators/movie.schema';

export const seriesRouter = Router();

seriesRouter.use(authenticate);

seriesRouter.get('/', SeriesController.getSeries);
seriesRouter.get('/stats', SeriesController.getStats);
seriesRouter.get('/check-exists', SeriesController.checkExists);
seriesRouter.post('/', validate(createSeriesSchema), SeriesController.createSeries);

seriesRouter.get('/:id', SeriesController.getSeriesById);
seriesRouter.put('/:id', validate(updateSeriesSchema), SeriesController.updateSeries);
seriesRouter.delete('/:id', SeriesController.deleteSeries);

seriesRouter.patch('/:id/favorite', validate(toggleFlagSchema), SeriesController.toggleFavorite);
seriesRouter.patch('/:id/watchlist', validate(toggleFlagSchema), SeriesController.toggleWatchlist);
seriesRouter.post('/:id/rewatch', validate(rewatchMovieSchema), SeriesController.rewatch);

seriesRouter.get('/:id/sessions/comments', SeriesController.getSeriesSessionsWithComments);

// Nested Season & Episode routes
seriesRouter.get('/:seriesPublicId/seasons', SeriesController.getSeasons);
seriesRouter.post('/:seriesPublicId/seasons', SeriesController.createSeason);
seriesRouter.get('/:seriesPublicId/next-unwatched', SeriesController.getNextUnwatched);

export const seasonEpisodeRouter = Router();
seasonEpisodeRouter.use(authenticate);

seasonEpisodeRouter.get('/seasons/:seasonPublicId/episodes', SeriesController.getEpisodes);
seasonEpisodeRouter.post('/seasons/:seasonPublicId/episodes', SeriesController.createEpisode);
seasonEpisodeRouter.patch('/episodes/:episodePublicId/watched', SeriesController.markEpisodeWatched);
seasonEpisodeRouter.put('/episodes/:episodePublicId', SeriesController.updateEpisode);
