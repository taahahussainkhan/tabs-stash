import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { syncLimiter } from '../middlewares/rate-limiter.middleware';
import { createCardSchema, updateCardSchema, cardsDeltaSyncSchema } from '../validators/card.schema';

export const cardRouter = Router();

// All card routes require valid JWT authentication
cardRouter.use(authenticate);

// RESTful Card endpoints
cardRouter.get('/', CardController.getCards);
cardRouter.post('/', validate(createCardSchema), CardController.saveCard);
cardRouter.put('/:id', validate(updateCardSchema), CardController.updateCard);
cardRouter.patch('/:id/pin', CardController.togglePin);
cardRouter.delete('/:id', CardController.deleteCard);
cardRouter.post('/delta', syncLimiter, validate(cardsDeltaSyncSchema), CardController.deltaSync);
