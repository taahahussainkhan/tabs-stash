import { Router } from 'express';
import { GenreController, PublisherController, StoreController } from '../controllers/auxiliary.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createGenreSchema,
  createPublisherSchema,
  updatePublisherSchema,
  createStoreSchema,
  updateStoreSchema,
} from '../validators/auxiliary.schema';

export const genreRouter = Router();
genreRouter.use(authenticate);
genreRouter.get('/', GenreController.getAll);
genreRouter.post('/', validate(createGenreSchema), GenreController.create);
genreRouter.delete('/:id', GenreController.delete);

export const publisherRouter = Router();
publisherRouter.use(authenticate);
publisherRouter.get('/', PublisherController.getAll);
publisherRouter.post('/', validate(createPublisherSchema), PublisherController.create);
publisherRouter.put('/:id', validate(updatePublisherSchema), PublisherController.update);
publisherRouter.delete('/:id', PublisherController.delete);

export const storeRouter = Router();
storeRouter.use(authenticate);
storeRouter.get('/', StoreController.getAll);
storeRouter.post('/', validate(createStoreSchema), StoreController.create);
storeRouter.put('/:id', validate(updateStoreSchema), StoreController.update);
storeRouter.delete('/:id', StoreController.delete);
