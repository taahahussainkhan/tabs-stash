import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { QuickRecordModel, QuickMediaType } from '../models/quick-record.model';
import { QuickLogModel } from '../models/quick-log.model';
import { AppError } from '../middlewares/error.middleware';
import {
  CreateQuickRecordInput,
  UpdateQuickRecordInput,
  CreateQuickLogInput,
} from '../validators/quick-record.schema';

export interface QuickRecordDTO {
  id: string;
  mediaType: QuickMediaType;
  title: string;
  status: 'active' | 'dissolved';
  dissolvedAt: number | null;
  ampedAt: number | null;
  linkedMediaType: QuickMediaType | null;
  linkedMediaId: string | null;
  createdAt: number;
  updatedAt: number;
  logCount?: number;
  lastStampedAt?: number | null;
  logs?: QuickLogDTO[];
}

export interface QuickLogDTO {
  id: string;
  recordId: string;
  note: string;
  stampedAt: number;
  ampedAt: number | null;
  createdAt: number;
}

function toRecordDTO(doc: any): QuickRecordDTO {
  return {
    id: doc.publicId,
    mediaType: doc.mediaType,
    title: doc.title,
    status: doc.status,
    dissolvedAt: doc.dissolvedAt ?? null,
    ampedAt: doc.ampedAt ?? null,
    linkedMediaType: doc.linkedMediaType ?? null,
    linkedMediaId: doc.linkedMediaId ?? null,
    createdAt: new Date(doc.createdAt).getTime(),
    updatedAt: doc.serverUpdatedAt,
  };
}

function toLogDTO(doc: any): QuickLogDTO {
  return {
    id: doc.publicId,
    recordId: doc.recordId,
    note: doc.note ?? '',
    stampedAt: doc.stampedAt,
    ampedAt: doc.ampedAt ?? null,
    createdAt: new Date(doc.createdAt).getTime(),
  };
}

export class QuickRecordService {
  /**
   * List records for a user. Dissolved records are hidden unless requested.
   */
  static async listRecords(
    userId: string,
    includeDissolved = false,
    withLogs = false
  ): Promise<QuickRecordDTO[]> {
    const filter: Record<string, any> = { userId };
    if (!includeDissolved) filter.status = 'active';

    const docs = await QuickRecordModel.find(filter).sort({ updatedAt: -1 }).lean();

    // Attach log counts + last stamp in one aggregation-friendly pass
    const ids = docs.map((d) => d.publicId);
    const stats = await QuickLogModel.aggregate<{ _id: string; count: number; last: number }>([
      { $match: { userId: new Types.ObjectId(userId), recordId: { $in: ids } } },
      { $group: { _id: '$recordId', count: { $sum: 1 }, last: { $max: '$stampedAt' } } },
    ]);
    const statMap = new Map(stats.map((s) => [s._id, s]));

    // Optionally embed every log (used by the web MediaLog feed to render in one call)
    let logsByRecord: Map<string, QuickLogDTO[]> | null = null;
    if (withLogs && ids.length > 0) {
      const allLogs = await QuickLogModel.find({ userId, recordId: { $in: ids } })
        .sort({ stampedAt: -1 })
        .lean();
      logsByRecord = new Map();
      for (const log of allLogs) {
        const list = logsByRecord.get(log.recordId) || [];
        list.push(toLogDTO(log));
        logsByRecord.set(log.recordId, list);
      }
    }

    return docs.map((d) => {
      const dto = toRecordDTO(d);
      const s = statMap.get(dto.id);
      dto.logCount = s?.count ?? 0;
      dto.lastStampedAt = s?.last ?? null;
      if (logsByRecord) dto.logs = logsByRecord.get(dto.id) || [];
      return dto;
    });
  }

  /**
   * Upsert on the client-generated publicId so a phone retrying an offline
   * capture never hits a duplicate-key 500 (drops never lose a timestamp).
   */
  static async createRecord(userId: string, input: CreateQuickRecordInput): Promise<QuickRecordDTO> {
    const now = Date.now();
    const doc = await QuickRecordModel.findOneAndUpdate(
      { userId, publicId: input.id ?? randomUUID() },
      {
        $setOnInsert: {
          userId,
          mediaType: input.mediaType,
          title: input.title,
          status: 'active',
        },
        $set: { clientUpdatedAt: now, serverUpdatedAt: now },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    return toRecordDTO(doc);
  }

  static async getRecord(userId: string, publicId: string): Promise<QuickRecordDTO> {
    const doc = await QuickRecordModel.findOne({ userId, publicId }).lean();
    if (!doc) throw new AppError('Record not found', 404);
    return toRecordDTO(doc);
  }

  static async updateRecord(
    userId: string,
    publicId: string,
    input: UpdateQuickRecordInput
  ): Promise<QuickRecordDTO> {
    const now = Date.now();
    const update: Record<string, any> = { serverUpdatedAt: now, clientUpdatedAt: now };
    if (input.title !== undefined) update.title = input.title;
    if (input.mediaType !== undefined) update.mediaType = input.mediaType;

    const doc = await QuickRecordModel.findOneAndUpdate(
      { userId, publicId },
      { $set: update },
      { new: true }
    ).lean();
    if (!doc) throw new AppError('Record not found', 404);
    return toRecordDTO(doc);
  }

  /**
   * Dissolve = soft-remove. Never deletes from DB; flips status.
   */
  static async dissolveRecord(userId: string, publicId: string): Promise<QuickRecordDTO> {
    const now = Date.now();
    const doc = await QuickRecordModel.findOneAndUpdate(
      { userId, publicId },
      { $set: { status: 'dissolved', dissolvedAt: now, serverUpdatedAt: now, clientUpdatedAt: now } },
      { new: true }
    ).lean();
    if (!doc) throw new AppError('Record not found', 404);
    return toRecordDTO(doc);
  }

  static async restoreRecord(userId: string, publicId: string): Promise<QuickRecordDTO> {
    const now = Date.now();
    const doc = await QuickRecordModel.findOneAndUpdate(
      { userId, publicId },
      { $set: { status: 'active', dissolvedAt: null, serverUpdatedAt: now, clientUpdatedAt: now } },
      { new: true }
    ).lean();
    if (!doc) throw new AppError('Record not found', 404);
    return toRecordDTO(doc);
  }

  // ---------------- Logs ----------------

  static async listLogs(userId: string, recordId: string): Promise<QuickLogDTO[]> {
    const docs = await QuickLogModel.find({ userId, recordId }).sort({ stampedAt: -1 }).lean();
    return docs.map(toLogDTO);
  }

  static async addLog(
    userId: string,
    recordId: string,
    input: CreateQuickLogInput
  ): Promise<QuickLogDTO> {
    const record = await QuickRecordModel.findOne({ userId, publicId: recordId }).lean();
    if (!record) throw new AppError('Record not found', 404);

    const now = Date.now();
    const stampedAt = input.stampedAt ?? now;
    const doc = await QuickLogModel.findOneAndUpdate(
      { userId, publicId: input.id ?? randomUUID() },
      {
        $setOnInsert: {
          userId,
          recordId,
          note: input.note ?? '',
          stampedAt,
        },
        $set: { clientUpdatedAt: now, serverUpdatedAt: now },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();
    // bump record's updatedAt so list ordering reflects the new stamp
    await QuickRecordModel.updateOne(
      { userId, publicId: recordId },
      { $set: { serverUpdatedAt: now, clientUpdatedAt: now } }
    );
    return toLogDTO(doc);
  }
}
