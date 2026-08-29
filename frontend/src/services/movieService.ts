import { BaseService } from './baseService'
import type { MovieSchemaData } from '../features/movies/schemas/movieSchema'
import type {
  MovieLog,
  MovieLogCreate,
  MovieStats,
  PaginationParams,
  SessionHistory,
} from '../features/movies/types/movie'
import { api } from '../app/api'

// Backend response types
interface MovieOut {
  public_id: string
  title: string
  director?: string | null
  year?: number | null
  genre?: string | null
  poster_image?: string | null
  is_favorite?: boolean
  is_watchlist?: boolean
  created_at: string
  updated_at: string
}

interface SessionOut {
  public_id: string
  status: 'watching' | 'completed' | 'paused' | 'rewatching'
  start_date: string
  end_date?: string | null
  current_position?: number | null
  stop_reason?: string | null
  is_rewatch: boolean
  rating?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

interface MovieWithCurrentSessionOut {
  movie: MovieOut
  current_session?: SessionOut | null
  rewatch_count: number
}

interface MovieWithSessionsOut {
  movie: MovieOut
  current_session?: SessionOut | null
  sessions: SessionOut[]
}

interface BackendCommentOut {
  public_id: string
  loggable_type: string
  content: string
  timestamp?: number | null
  chapter_or_episode?: string | null
  is_spoiler: boolean
  created_at: string
  updated_at: string
}

interface MovieSessionsWithCommentsOut {
  movie: MovieOut
  sessions: Array<{
    session: SessionOut
    comments: BackendCommentOut[]
  }>
}

function mapToMovieLog(item: MovieWithCurrentSessionOut): MovieLog {
  const { movie, current_session } = item
  return {
    id: movie.public_id,
    public_id: movie.public_id,
    title: movie.title,
    director: movie.director ?? undefined,
    year: movie.year ?? undefined,
    genre: movie.genre ?? undefined,
    poster_image: movie.poster_image ?? undefined,
    platform: undefined,
    rating: current_session?.rating ?? undefined,
    notes: current_session?.notes ?? undefined,
    status: current_session?.status ?? 'watching',
    start_date: current_session?.start_date ?? movie.created_at,
    end_date: current_session?.end_date ?? null,
    current_timestamp: current_session?.current_position ?? undefined,
    stop_reason: current_session?.stop_reason ?? undefined,
    is_rewatch: current_session?.is_rewatch ?? false,
    is_favorite: movie.is_favorite ?? false,
    is_watchlist: movie.is_watchlist ?? false,
    created_at: movie.created_at,
    updated_at: movie.updated_at,
    rewatch_count: item.rewatch_count,
  }
}

function mapMovieWithSessionsToMovieLog(item: MovieWithSessionsOut): MovieLog {
  const { movie, current_session, sessions } = item
  const rewatch_count = sessions.reduce((count, s) => count + (s.is_rewatch ? 1 : 0), 0)
  return mapToMovieLog({ movie, current_session, rewatch_count })
}

export class MovieService extends BaseService<MovieLog, MovieSchemaData, MovieSchemaData, MovieWithCurrentSessionOut> {
  constructor() {
    super({
      endpoint: '/logging/movies',
      queryKey: 'movies',
      mapper: mapToMovieLog,
    })
  }

  // Override getById to handle complex detail response
  async getById(id: string): Promise<MovieLog> {
    const response = await api.get<MovieWithSessionsOut>(`${this.endpoint}/${id}`)
    return mapMovieWithSessionsToMovieLog(response.data)
  }

  async getMovieSessionsWithComments(id: string): Promise<{ movie: MovieLog; sessions: SessionHistory[] }> {
    const response = await api.get<MovieSessionsWithCommentsOut>(`${this.endpoint}/${id}/sessions/comments`)
    const { movie, sessions } = response.data

    const movieLog = mapMovieWithSessionsToMovieLog({
      movie,
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

    return { movie: movieLog, sessions: sessionHistories }
  }

  async getStats(): Promise<MovieStats> {
    const response = await api.get<MovieStats>(`${this.endpoint}/stats`)
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
  
    async createWatchlist(data: any): Promise<MovieLog> {
      const response = await api.post<MovieWithSessionsOut>(`${this.endpoint}/watchlist`, data)
      return mapMovieWithSessionsToMovieLog(response.data)
    }
  }

export const movieService = new MovieService()
