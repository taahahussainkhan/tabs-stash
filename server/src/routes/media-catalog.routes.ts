import { Router } from 'express';
import { mediaCatalogController } from '../controllers/media-catalog.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const mediaCatalogRouter = Router();

mediaCatalogRouter.get('/search', (req, res) => mediaCatalogController.search(req, res));
mediaCatalogRouter.get('/details/:type/:id', (req, res) => mediaCatalogController.getDetails(req, res));
