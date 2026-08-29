import { api } from '../../../app/api'
import type { MovieSchemaData } from '../../movies/schemas/movieSchema'
import type {
  SeriesLog,
  SeriesLogCreate,
  SeriesStats,
  PaginationParams,
  SeriesWithCurrentSessionOut,
  SeriesWithSessionsOut,
  SeriesSessionsWithCommentsOut,
  SessionHistory,
  BackendCommentOut,
} from '../types/series'
import type { PaginatedResponse } from '../../../shared/types/pagination'

// Convert form data to API format
function convertFormDataToSeriesCreate(formData: MovieSchemaData): SeriesLogCreate {
  return {
    title: formData.title,
    creator: formData.director || undefined,
    year: formData.year || undefined,
    genre: formData.genre || undefined,
    platform: formData.platform || undefined,
    rating: formData.rating || undefined,
    notes: formData.notes || undefined,
    status: formData.status,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    current_timestamp: formData.current_timestamp || undefined,
    stop_reason: formData.stop_reason || undefined,
    is_rewatch: formData.is_rewatch,
    seasons: (formData as any).seasons || undefined,
  }
}

function mapSeriesWithCurrentSessionToSeriesLog(item: SeriesWithCurrentSessionOut): SeriesLog {
  const { series, current_session } = item

  return {
    id: series.public_id, // Map public_id to id
    title: series.title,
    creator: series.creator ?? undefined,
    year: series.year ?? undefined,
    genre: series.genre ?? undefined,
    platform: undefined,
    rating: current_session?.rating ?? undefined,
    notes: current_session?.notes ?? undefined,
    status: current_session?.status ?? 'watching',
    start_date: current_session?.start_date ?? series.created_at,
    end_date: current_session?.end_date ?? null,
    current_timestamp: current_session?.current_position ?? undefined,
    stop_reason: current_session?.stop_reason ?? undefined,
    is_rewatch: current_session?.is_rewatch ?? false,
    is_favorite: series.is_favorite ?? false,
    is_watchlist: series.is_watchlist ?? false,
    created_at: series.created_at,
    updated_at: series.updated_at,
    rewatch_count: item.rewatch_count,
  }
}

function mapSeriesWithSessionsToSeriesLog(item: SeriesWithSessionsOut): SeriesLog {
  const { series, current_session, sessions } = item
  const rewatch_count = sessions.reduce(
    (count, s) => count + (s.is_rewatch ? 1 : 0),
    0,
  )
  return mapSeriesWithCurrentSessionToSeriesLog({ series, current_session, rewatch_count })
}

export const seriesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<SeriesLog>> => {
    const response = await api.get<PaginatedResponse<SeriesWithCurrentSessionOut>>('/logging/series', { params })
    
    return {
      ...response.data,
      items: response.data.items.map(mapSeriesWithCurrentSessionToSeriesLog),
    }
  },

  getOne: async (id: string): Promise<SeriesLog> => {
    const response = await api.get<SeriesWithSessionsOut>(`/logging/series/${id}`)
    return mapSeriesWithSessionsToSeriesLog(response.data)
  },

  getWithSessions: async (id: string): Promise<SeriesWithSessionsOut> => {
    const response = await api.get<SeriesWithSessionsOut>(`/logging/series/${id}`)
    return response.data
  },

  getSessionsWithComments: async (id: string): Promise<{ series: SeriesLog; sessions: SessionHistory[] }> => {
    const response = await api.get<SeriesSessionsWithCommentsOut>(
      `/logging/series/${id}/sessions/comments`,
    )
    const { series, sessions } = response.data

    const seriesLog = mapSeriesWithSessionsToSeriesLog({
      series,
      current_session: sessions[sessions.length - 1]?.session ?? null,
      sessions: sessions.map((s) => s.session),
    })

    const sessionHistories: SessionHistory[] = sessions.map(({ session, comments }) => {
      return {
        sessionPublicId: session.public_id,
        status: session.status,
        startDate: session.start_date,
        endDate: session.end_date ?? null,
        isRewatch: session.is_rewatch,
        rating: session.rating ?? null,
        notes: session.notes ?? null,
        comments: comments.map((c) => ({
          public_id: c.public_id,
          timestamp: c.timestamp ?? 0,
          duration: c.chapter_or_episode != null ? Number(c.chapter_or_episode) || undefined : undefined,
          text: c.content,
        })),
      }
    })

    return { series: seriesLog, sessions: sessionHistories }
  },

  create: async (series: MovieSchemaData): Promise<SeriesLog> => {
    const seriesData = convertFormDataToSeriesCreate(series)
    const seriesDataWithDates = {
      ...seriesData,
      start_date: new Date(seriesData.start_date).toISOString(),
      end_date: seriesData.end_date ? new Date(seriesData.end_date).toISOString() : null,
    }
    const response = await api.post<SeriesWithSessionsOut>('/logging/series', seriesDataWithDates)
    return mapSeriesWithSessionsToSeriesLog(response.data)
  },

  createWatchlist: async (data: { title: string; creator?: string; year?: number; genre?: string }): Promise<SeriesLog> => {
    const seriesData = {
      title: data.title,
      creator: data.creator || undefined,
      year: data.year || undefined,
      genre: data.genre || undefined,
      status: 'paused' as const,
      start_date: new Date().toISOString(),
      is_rewatch: false,
    }
    const response = await api.post<SeriesWithSessionsOut>('/logging/series', seriesData)
    
    await api.patch(`/logging/series/${response.data.series.public_id}/watchlist`, null, {
      params: { is_watchlist: true }
    })
    
    const updatedResponse = await api.get<SeriesWithSessionsOut>(`/logging/series/${response.data.series.public_id}`)
    return mapSeriesWithSessionsToSeriesLog(updatedResponse.data)
  },

  update: async (id: string, series: MovieSchemaData): Promise<SeriesLog> => {
    const seriesData = convertFormDataToSeriesCreate(series)
    const seriesDataWithDates = {
      ...seriesData,
      start_date: new Date(seriesData.start_date).toISOString(),
      end_date: seriesData.end_date ? new Date(seriesData.end_date).toISOString() : null,
    }
    const response = await api.put<SeriesWithSessionsOut>(`/logging/series/${id}`, seriesDataWithDates)
    return mapSeriesWithSessionsToSeriesLog(response.data)
  },

  startRewatch: async (id: string, series: MovieSchemaData): Promise<SeriesLog> => {
    const seriesData = convertFormDataToSeriesCreate(series)
    const seriesDataWithDates = {
      ...seriesData,
      start_date: new Date(seriesData.start_date).toISOString(),
      end_date: seriesData.end_date ? new Date(seriesData.end_date).toISOString() : null,
    }
    const response = await api.post<SeriesWithSessionsOut>(
      `/logging/series/${id}/rewatch`,
      seriesDataWithDates,
    )
    return mapSeriesWithSessionsToSeriesLog(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/logging/series/${id}`)
  },

  getStats: async (): Promise<SeriesStats> => {
    const response = await api.get<SeriesStats>('/logging/series/stats')
    return response.data
  },

  checkExists: async (title: string): Promise<{ exists: boolean; title: string; status?: string; public_id?: string }> => {
    const response = await api.get<{ exists: boolean; title: string; status?: string; public_id?: string }>('/logging/series/check-exists', {
      params: { title }
    })
    return response.data
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<{ message: string; is_favorite: boolean }> => {
    const response = await api.patch<{ message: string; is_favorite: boolean }>(
      `/logging/series/${id}/favorite`,
      null,
      { params: { is_favorite: isFavorite } }
    )
    return response.data
  },

  toggleWatchlist: async (id: string, isWatchlist: boolean): Promise<{ message: string; is_watchlist: boolean }> => {
    const response = await api.patch<{ message: string; is_watchlist: boolean }>(
      `/logging/series/${id}/watchlist`,
      null,
      { params: { is_watchlist: isWatchlist } }
    )
    return response.data
  },

  getSessionComments: async (sessionId: string) => {
    const response = await api.get<BackendCommentOut[]>(`/logging/sessions/${sessionId}/comments`)
    return response.data.map((c) => ({
      public_id: c.public_id,
      timestamp: c.timestamp ?? 0,
      duration: c.chapter_or_episode != null ? Number(c.chapter_or_episode) || undefined : undefined,
      text: c.content,
    }))
  }
}
