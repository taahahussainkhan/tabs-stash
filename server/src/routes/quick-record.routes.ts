import { Router } from 'express';
import { QuickRecordController } from '../controllers/quick-record.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createQuickRecordSchema,
  updateQuickRecordSchema,
  createQuickLogSchema,
} from '../validators/quick-record.schema';

export const quickRecordRouter = Router();

quickRecordRouter.use(authenticate);

quickRecordRouter.get('/', QuickRecordController.listRecords);
quickRecordRouter.post('/', validate(createQuickRecordSchema), QuickRecordController.createRecord);
quickRecordRouter.get('/:id', QuickRecordController.getRecord);
quickRecordRouter.patch('/:id', validate(updateQuickRecordSchema), QuickRecordController.updateRecord);
quickRecordRouter.delete('/:id', QuickRecordController.dissolveRecord); // dissolve = soft remove
quickRecordRouter.post('/:id/restore', QuickRecordController.restoreRecord);

// Logs (timestamped free-form entries)
quickRecordRouter.get('/:id/logs', QuickRecordController.listLogs);
quickRecordRouter.post('/:id/logs', validate(createQuickLogSchema), QuickRecordController.addLog);
