import { api } from '../../../app/api'

export type MediaLogType = 'movie' | 'series' | 'book'

export interface MediaLogEntry {
  id: string
  recordId: string
  note: string
  stampedAt: number
  ampedAt: number | null
  createdAt: number
}

export interface MediaLogRecord {
  id: string
  mediaType: MediaLogType
  title: string
  status: 'active' | 'dissolved'
  dissolvedAt: number | null
  ampedAt: number | null
  createdAt: number
  updatedAt: number
  logCount?: number
  lastStampedAt?: number | null
  logs?: MediaLogEntry[]
}

export const medalogApi = {
  getRecords: async (includeDissolved = true): Promise<MediaLogRecord[]> => {
    const res = await api.get('/quick-records', {
      params: { withLogs: true, includeDissolved },
    })
    return res.data?.data ?? []
  },
}
