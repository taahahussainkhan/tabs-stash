import { Router } from 'express';
import { AuthorController } from '../controllers/author.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createAuthorSchema, updateAuthorSchema } from '../validators/author.schema';

export const authorRouter = Router();

authorRouter.use(authenticate);

authorRouter.get('/', AuthorController.getAll);
authorRouter.get('/:id', AuthorController.getById);
authorRouter.post('/', validate(createAuthorSchema), AuthorController.create);
authorRouter.put('/:id', validate(updateAuthorSchema), AuthorController.update);
authorRouter.delete('/:id', AuthorController.delete);
