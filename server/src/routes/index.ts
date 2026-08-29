import { Router } from 'express';
import { authRouter } from './auth.routes';
import { syncRouter } from './sync.routes';
import { userRouter } from './user.routes';
import { tagRouter } from './tag.routes';
import { movieRouter } from './movie.routes';
import { seriesRouter, seasonEpisodeRouter } from './series.routes';
import { bookRouter } from './book.routes';
import { authorRouter } from './author.routes';
import { genreRouter, publisherRouter, storeRouter } from './auxiliary.routes';
import { commentRouter, sessionCommentRouter } from './comment.routes';
import { userSettingsRouter, loggingCategoriesRouter } from './settings.routes';
import { dashboardRouter } from './dashboard.routes';

export const apiRouter = Router();

apiRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'TabVault & Personal Assistant API',
    version: '2.0.0',
  });
});

// 1. Core Auth & Sync Routes (Untouched for extension)
apiRouter.use('/auth', authRouter);
apiRouter.use('/sync', syncRouter);

// 2. Personal Assistant & Logger Routes
apiRouter.use('/users', userRouter);
apiRouter.use('/tags', tagRouter);

// Movies & Series (Mounted directly and under /logging for compatibility)
apiRouter.use('/movies', movieRouter);
apiRouter.use('/logging/movies', movieRouter);
apiRouter.use('/series', seriesRouter);
apiRouter.use('/logging/series', seriesRouter);
apiRouter.use('/logging', seasonEpisodeRouter);

// Books & Literature Ecosystem
apiRouter.use('/books', bookRouter);
apiRouter.use('/authors', authorRouter);
apiRouter.use('/genres', genreRouter);
apiRouter.use('/publishers', publisherRouter);
apiRouter.use('/stores', storeRouter);

// Comments & Sessions
apiRouter.use('/comments', commentRouter);
apiRouter.use('/sessions', sessionCommentRouter);

// User UI Settings & Category Preferences
apiRouter.use('/user', userSettingsRouter);
apiRouter.use('/logging', loggingCategoriesRouter);

// Dashboard & Search
apiRouter.use('/', dashboardRouter);
