import { Router } from 'express';
import { TagController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createTagSchema, updateTagSchema } from '../validators/tag.schema';

export const tagRouter = Router();

tagRouter.use(authenticate);

tagRouter.get('/', TagController.getAll);
tagRouter.post('/', validate(createTagSchema), TagController.create);
tagRouter.put('/:id', validate(updateTagSchema), TagController.update);
tagRouter.delete('/:id', TagController.delete);
