import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createBookSchema,
  updateBookSchema,
  readingProgressSchema,
  lendBookSchema,
} from '../validators/book.schema';

export const bookRouter = Router();

bookRouter.use(authenticate);

bookRouter.get('/', BookController.getBooks);
bookRouter.get('/stats', BookController.getStats);
bookRouter.post('/', validate(createBookSchema), BookController.createBook);

bookRouter.get('/:id', BookController.getBookDetails);
bookRouter.put('/:id', validate(updateBookSchema), BookController.updateBook);
bookRouter.delete('/:id', BookController.deleteBook);

bookRouter.post('/:id/reading/start', BookController.startReading);
bookRouter.put('/sessions/:id/progress', validate(readingProgressSchema), BookController.updateProgress);
bookRouter.post('/:id/lend', validate(lendBookSchema), BookController.lendBook);
bookRouter.post('/:id/return', BookController.returnBook);
