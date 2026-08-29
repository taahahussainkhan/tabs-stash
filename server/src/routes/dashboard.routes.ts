import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/dashboard', DashboardController.getDashboard);
dashboardRouter.get('/dashboard/stats', DashboardController.getStats);
dashboardRouter.get('/search', DashboardController.search);
