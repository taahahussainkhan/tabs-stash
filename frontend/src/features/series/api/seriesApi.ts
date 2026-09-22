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
function convertFormDataToSeriesCreate(formData: MovieSchemaData): any {
  return {
    title: formData.title,
    creator: formData.director || undefined,
    year: formData.year || undefined,
    genre: formData.genre || undefined,
    platform: formData.platform || undefined,
    rating: formData.rating || undefined,
    notes: formData.notes || undefined,
    status: formData.status,
    startDate: formData.start_date,
    start_date: formData.start_date,
    endDate: formData.end_date || null,
    end_date: formData.end_date || null,
    currentTimestamp: formData.current_timestamp || undefined,
    current_timestamp: formData.current_timestamp || undefined,
    stopReason: formData.stop_reason || undefined,
    stop_reason: formData.stop_reason || undefined,
    isRewatch: formData.is_rewatch,
    is_rewatch: formData.is_rewatch,
    posterImage: (formData as any).poster_image || (formData as any).posterImage || undefined,
    externalId: (formData as any).externalId || (formData as any).external_id || undefined,
    seasons: (formData as any).seasons || undefined,
  }
}

function mapSeriesWithCurrentSessionToSeriesLog(item: any): SeriesLog {
  const series = item.series || item
  const current_session = item.current_session || item.currentSessionId || series?.currentSessionId

  const id = series?.public_id || series?.publicId || series?.id || item?.public_id || item?.publicId || item?.id || ''

  const allEpisodes = Array.isArray(series?.seasons)
    ? series.seasons.flatMap((s: any) => s.episodes || [])
    : []
  const totalEpisodes = series?.total_episodes ?? item.total_episodes ?? allEpisodes.length
  const watchedEpisodes = series?.episodes_watched ?? item.episodes_watched ?? allEpisodes.filter((e: any) => e.is_watched || e.isWatched).length

  return {
    id,
    public_id: id,
    title: series?.title || item.title || '',
    creator: series?.creator ?? item.creator ?? undefined,
    year: series?.year ?? item.year ?? undefined,
    genre: series?.genre ?? item.genre ?? undefined,
    poster_image: series?.poster_image || series?.posterImage || item.poster_image || item.posterImage || undefined,
    platform: series?.platform || item.platform || undefined,
    rating: current_session?.rating ?? undefined,
    notes: current_session?.notes ?? undefined,
    status: current_session?.status ?? series?.status ?? 'to_watch',
    start_date: current_session?.start_date || current_session?.startDate || series?.created_at || series?.createdAt || item.created_at || item.createdAt || new Date().toISOString(),
    end_date: current_session?.end_date || current_session?.endDate || null,
    current_timestamp: current_session?.current_position ?? current_session?.currentPosition ?? undefined,
    stop_reason: current_session?.stop_reason || current_session?.stopReason || undefined,
    is_rewatch: current_session?.is_rewatch ?? current_session?.isRewatch ?? false,
    is_favorite: series?.is_favorite ?? series?.isFavorite ?? item.is_favorite ?? item.isFavorite ?? false,
    is_watchlist: series?.is_watchlist ?? series?.isWatchlist ?? item.is_watchlist ?? item.isWatchlist ?? false,
    created_at: series?.created_at || series?.createdAt || item.created_at || item.createdAt || new Date().toISOString(),
    updated_at: series?.updated_at || series?.updatedAt || item.updated_at || item.updatedAt || new Date().toISOString(),
    rewatch_count: item.rewatch_count || 0,
    total_episodes: totalEpisodes > 0 ? totalEpisodes : undefined,
    episodes_watched: watchedEpisodes,
  }
}

function mapSeriesWithSessionsToSeriesLog(item: any): SeriesLog {
  const series = item.series || item
  const current_session = item.current_session || item.currentSessionId
  const sessions = item.sessions || []
  const rewatch_count = Array.isArray(sessions)
    ? sessions.reduce(
        (count: number, s: any) => count + (s.is_rewatch || s.isRewatch ? 1 : 0),
        0,
      )
    : 0
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
        sessionId: session.public_id,
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
      startDate: seriesData.startDate ? new Date(seriesData.startDate).toISOString() : new Date().toISOString(),
      endDate: seriesData.endDate ? new Date(seriesData.endDate).toISOString() : null,
      start_date: seriesData.start_date ? new Date(seriesData.start_date).toISOString() : new Date().toISOString(),
      end_date: seriesData.end_date ? new Date(seriesData.end_date).toISOString() : null,
    }
    const response = await api.post<SeriesWithSessionsOut>('/logging/series', seriesDataWithDates)
    return mapSeriesWithSessionsToSeriesLog(response.data)
  },

  createWatchlist: async (data: {
    title: string
    creator?: string
    director?: string
    year?: number
    genre?: string
    posterImage?: string
    externalId?: string
    seasons?: Array<{
      seasonNumber: number
      episodeCount: number
      title?: string
      year?: number
      episodes?: any[]
    }>
  }): Promise<SeriesLog> => {
    const seriesData = {
      title: data.title,
      creator: data.creator || data.director || undefined,
      year: data.year || undefined,
      genre: data.genre || undefined,
      posterImage: data.posterImage || undefined,
      externalId: data.externalId || undefined,
      status: 'paused' as const,
      startDate: new Date().toISOString(),
      isWatchlist: true,
      isRewatch: false,
      seasons: data.seasons && data.seasons.length > 0 ? data.seasons : undefined,
    }
    const response = await api.post<SeriesWithSessionsOut>('/logging/series', seriesData)
    return mapSeriesWithSessionsToSeriesLog(response.data)
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
