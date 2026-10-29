import { api } from '../../core/http';
import type { QuickLog, QuickRecord } from './types';

/** Wire shape of GET /quick-records (withLogs=true). */
interface ServerRecord {
  id: string;
  mediaType: QuickRecord['mediaType'];
  title: string;
  status: QuickRecord['status'];
  createdAt: number;
  updatedAt?: number;
  logs?: Array<{ id: string; note?: string; stampedAt: number }>;
}

export function serverRecordToLocal(doc: ServerRecord): QuickRecord {
  const logs: QuickLog[] = (doc.logs ?? []).map(l => ({
    id: l.id,
    note: l.note ?? '',
    stampedAt: l.stampedAt,
    synced: true,
  }));

  return {
    id: doc.id,
    mediaType: doc.mediaType,
    title: doc.title,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt ?? doc.createdAt,
    logs,
    synced: true,
    dissolveSynced: doc.status === 'dissolved',
    restorePending: false,
  };
}

export const quickRecordsApi = {
  list: () =>
    api.get<ServerRecord[]>('/quick-records', {
      query: { withLogs: true, includeDissolved: true },
    }),

  create: (record: QuickRecord) =>
    api.post('/quick-records', {
      id: record.id,
      mediaType: record.mediaType,
      title: record.title,
    }),

  addLog: (recordId: string, log: QuickLog) =>
    api.post(`/quick-records/${recordId}/logs`, {
      id: log.id,
      note: log.note,
      stampedAt: log.stampedAt,
    }),

  dissolve: (recordId: string) => api.delete(`/quick-records/${recordId}`),

  restore: (recordId: string) => api.post(`/quick-records/${recordId}/restore`),
};
