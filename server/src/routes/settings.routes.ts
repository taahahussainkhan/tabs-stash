import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  updateUserSettingsSchema,
  updateLayoutSettingsSchema,
  updateDashboardSettingsSchema,
  userPreferenceRequestSchema,
} from '../validators/settings.schema';

export const userSettingsRouter = Router();
userSettingsRouter.use(authenticate);

userSettingsRouter.get('/settings', SettingsController.getSettings);
userSettingsRouter.put('/settings', validate(updateUserSettingsSchema), SettingsController.updateSettings);
userSettingsRouter.patch('/settings/layout', validate(updateLayoutSettingsSchema), SettingsController.updateSettings);
userSettingsRouter.patch('/settings/dashboard', validate(updateDashboardSettingsSchema), SettingsController.updateSettings);

export const loggingCategoriesRouter = Router();
loggingCategoriesRouter.use(authenticate);

loggingCategoriesRouter.get('/categories', SettingsController.getCategories);
loggingCategoriesRouter.get('/categories/group/:group', SettingsController.getCategoriesByGroup);
loggingCategoriesRouter.get('/preferences', SettingsController.getUserPreferences);
loggingCategoriesRouter.post('/preferences', validate(userPreferenceRequestSchema), SettingsController.createOrUpdatePreference);
loggingCategoriesRouter.delete('/preferences/:categoryId', SettingsController.deletePreference);
