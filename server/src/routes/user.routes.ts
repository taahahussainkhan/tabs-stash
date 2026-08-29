import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { userProfileUpdateSchema, passwordChangeSchema } from '../validators/user.schema';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', UserController.getProfile);
userRouter.put('/profile', validate(userProfileUpdateSchema), UserController.updateProfile);
userRouter.post('/change-password', validate(passwordChangeSchema), UserController.changePassword);
