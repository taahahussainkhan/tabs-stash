import { BaseService } from './baseService'
import type { MovieSchemaData } from '../features/movies/schemas/movieSchema'
import type {
  SeriesLog,
  SeriesLogCreate,
  SeriesStats,
  SessionHistory,
  SeriesWithCurrentSessionOut,
  SeriesWithSessionsOut,
  SeriesSessionsWithCommentsOut,
} from '../features/series/types/series'
import { api } from '../app/api'

function mapToSeriesLog(item: SeriesWithCurrentSessionOut): SeriesLog {
  const { series, current_session } = item
  return {
    id: series.public_id,
    public_id: series.public_id,
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
  const rewatch_count = sessions.reduce((count, s) => count + (s.is_rewatch ? 1 : 0), 0)
  return mapToSeriesLog({ series, current_session, rewatch_count })
}

export class SeriesService extends BaseService<SeriesLog, SeriesLogCreate | MovieSchemaData, MovieSchemaData, SeriesWithCurrentSessionOut> {
  constructor() {
    super({
      endpoint: '/logging/series',
      queryKey: 'series',
      mapper: mapToSeriesLog,
    })
  }

  async getById(id: string): Promise<SeriesLog> {
    const response = await api.get<SeriesWithSessionsOut>(`${this.endpoint}/${id}`)
    return mapSeriesWithSessionsToSeriesLog(response.data)
  }

  async getSeriesSessionsWithComments(id: string): Promise<{ series: SeriesLog; sessions: SessionHistory[] }> {
    const response = await api.get<SeriesSessionsWithCommentsOut>(`${this.endpoint}/${id}/sessions/comments`)
    const { series, sessions } = response.data

    const seriesLog = mapSeriesWithSessionsToSeriesLog({
      series,
      current_session: sessions[sessions.length - 1]?.session ?? null,
      sessions: sessions.map((s) => s.session),
    })

    const sessionHistories: SessionHistory[] = sessions.map(({ session, comments }) => ({
      sessionId: session.public_id,
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
    }))

    return { series: seriesLog, sessions: sessionHistories }
  }

  async getStats(): Promise<SeriesStats> {
    const response = await api.get<SeriesStats>(`${this.endpoint}/stats`)
    return response.data
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<boolean> {
    const response = await api.patch<{ is_favorite: boolean }>(`${this.endpoint}/${id}/favorite`, null, {
      params: { is_favorite: isFavorite },
    })
    return response.data.is_favorite
  }

  async toggleWatchlist(id: string, isWatchlist: boolean): Promise<boolean> {
    const response = await api.patch<{ is_watchlist: boolean }>(`${this.endpoint}/${id}/watchlist`, null, {
      params: { is_watchlist: isWatchlist },
    })
    return response.data.is_watchlist
  }

  async checkExists(title: string): Promise<{ exists: boolean; title: string; status?: string; public_id?: string }> {
    const response = await api.get<{ exists: boolean; title: string; status?: string; public_id?: string }>(`${this.endpoint}/check-exists`, {
      params: { title }
    })
    return response.data
  }
}

export const seriesService = new SeriesService()
