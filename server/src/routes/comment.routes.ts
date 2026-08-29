import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createCommentSchema,
  updateCommentSchema,
  replaceSessionCommentsSchema,
} from '../validators/comment.schema';

export const commentRouter = Router();

commentRouter.use(authenticate);

commentRouter.post('/', validate(createCommentSchema), CommentController.createComment);
commentRouter.put('/:id', validate(updateCommentSchema), CommentController.updateComment);
commentRouter.delete('/:id', CommentController.deleteComment);

export const sessionCommentRouter = Router();
sessionCommentRouter.use(authenticate);

sessionCommentRouter.get('/:id/comments', CommentController.getSessionComments);
sessionCommentRouter.post('/:id/comments', validate(replaceSessionCommentsSchema), CommentController.replaceSessionComments);
