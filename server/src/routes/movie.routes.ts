import { Router } from 'express';
import { MovieController } from '../controllers/movie.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createMovieSchema,
  createWatchlistMovieSchema,
  updateMovieSchema,
  rewatchMovieSchema,
  toggleFlagSchema,
} from '../validators/movie.schema';

export const movieRouter = Router();

movieRouter.use(authenticate);

movieRouter.get('/', MovieController.getMovies);
movieRouter.get('/stats', MovieController.getStats);
movieRouter.get('/check-exists', MovieController.checkExists);
movieRouter.post('/', validate(createMovieSchema), MovieController.createMovie);
movieRouter.post('/watchlist', validate(createWatchlistMovieSchema), MovieController.createWatchlistMovie);

movieRouter.get('/:id', MovieController.getMovie);
movieRouter.put('/:id', validate(updateMovieSchema), MovieController.updateMovie);
movieRouter.delete('/:id', MovieController.deleteMovie);

movieRouter.patch('/:id/favorite', validate(toggleFlagSchema), MovieController.toggleFavorite);
movieRouter.patch('/:id/watchlist', validate(toggleFlagSchema), MovieController.toggleWatchlist);
movieRouter.post('/:id/rewatch', validate(rewatchMovieSchema), MovieController.rewatch);

movieRouter.get('/:id/sessions/comments', MovieController.getMovieSessionsWithComments);
