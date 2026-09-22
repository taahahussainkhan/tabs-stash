import { api } from '../../../app/api'
import type { 
  MovieLog, 
  MovieLogCreate, 
  MovieStats, 
  PaginationParams, 
  MovieWithCurrentSessionOut,
  MovieWithSessionsOut,
  MovieSessionsWithCommentsOut,
  SessionHistory,
  BackendCommentOut,
  MoviesPaginatedResponse
} from '../types/movie'
import type { MovieSchemaData } from '../schemas/movieSchema'

// Mappers
function mapMovieWithCurrentSessionToMovieLog(item: any): MovieLog {
  const movie = item.movie || item
  const current_session = item.current_session || item.currentSessionId || movie?.currentSessionId

  const id = movie?.public_id || movie?.publicId || movie?.id || item?.public_id || item?.publicId || item?.id || ''

  return {
    id,
    public_id: id,
    title: movie?.title || item.title || '',
    director: movie?.director ?? item.director ?? undefined,
    year: movie?.year ?? item.year ?? undefined,
    genre: movie?.genre ?? item.genre ?? undefined,
    poster_image: movie?.poster_image || movie?.posterImage || item.poster_image || item.posterImage || undefined,
    platform: movie?.platform || item.platform || undefined,
    rating: current_session?.rating ?? undefined,
    notes: current_session?.notes ?? undefined,
    status: current_session?.status ?? movie?.status ?? 'to_watch',
    start_date: current_session?.start_date || current_session?.startDate || movie?.created_at || movie?.createdAt || item.created_at || item.createdAt || new Date().toISOString(),
    end_date: current_session?.end_date || current_session?.endDate || null,
    current_timestamp: current_session?.current_position ?? current_session?.currentPosition ?? undefined,
    stop_reason: current_session?.stop_reason || current_session?.stopReason || undefined,
    is_rewatch: current_session?.is_rewatch ?? current_session?.isRewatch ?? false,
    is_favorite: movie?.is_favorite ?? movie?.isFavorite ?? item.is_favorite ?? item.isFavorite ?? false,
    is_watchlist: movie?.is_watchlist ?? movie?.isWatchlist ?? item.is_watchlist ?? item.isWatchlist ?? false,
    created_at: movie?.created_at || movie?.createdAt || item.created_at || item.createdAt || new Date().toISOString(),
    updated_at: movie?.updated_at || movie?.updatedAt || item.updated_at || item.updatedAt || new Date().toISOString(),
    rewatch_count: item.rewatch_count || 0,
  }
}

function mapMovieWithSessionsToMovieLog(item: any): MovieLog {
  const movie = item.movie || item
  const current_session = item.current_session || item.currentSessionId
  const sessions = item.sessions || []
  const rewatch_count = Array.isArray(sessions)
    ? sessions.reduce(
        (count: number, s: any) => count + (s.is_rewatch || s.isRewatch ? 1 : 0),
        0,
      )
    : 0
  return mapMovieWithCurrentSessionToMovieLog({ movie, current_session, rewatch_count })
}

function convertFormDataToMovieCreate(formData: MovieSchemaData): any {
  return {
    title: formData.title,
    director: formData.director || undefined,
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
    durationMinutes: (formData as any).duration_minutes || (formData as any).durationMinutes || undefined,
    externalId: (formData as any).externalId || (formData as any).external_id || undefined,
  }
}

export const moviesApi = {
  getMovies: async (params?: PaginationParams): Promise<MoviesPaginatedResponse> => {
    const { data } = await api.get<any>('/logging/movies', { params })
    return {
      ...data,
      items: data.items.map(mapMovieWithCurrentSessionToMovieLog)
    }
  },

  getMovie: async (id: string): Promise<MovieLog> => {
    const { data } = await api.get<MovieWithSessionsOut>(`/logging/movies/${id}`)
    return mapMovieWithSessionsToMovieLog(data)
  },

  getMovieWithSessions: async (id: string): Promise<MovieWithSessionsOut> => {
    const { data } = await api.get<MovieWithSessionsOut>(`/logging/movies/${id}`)
    return data
  },

  getMovieSessionsWithComments: async (id: string): Promise<{ movie: MovieLog; sessions: SessionHistory[] }> => {
    const { data } = await api.get<MovieSessionsWithCommentsOut>(`/logging/movies/${id}/sessions/comments`)
    const { movie, sessions } = data

    const movieLog = mapMovieWithSessionsToMovieLog({
      movie,
      current_session: sessions[sessions.length - 1]?.session ?? null,
      sessions: sessions.map((s) => s.session),
    })

    const sessionHistories: SessionHistory[] = sessions.map(({ session, comments }) => ({
      sessionId: session.public_id, // Renamed for consistency
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
  },

  create: async (movie: MovieSchemaData): Promise<MovieLog> => {
    const movieData = convertFormDataToMovieCreate(movie)
    const movieDataWithDates = {
      ...movieData,
      startDate: movieData.startDate ? new Date(movieData.startDate).toISOString() : new Date().toISOString(),
      endDate: movieData.endDate ? new Date(movieData.endDate).toISOString() : null,
      start_date: movieData.start_date ? new Date(movieData.start_date).toISOString() : new Date().toISOString(),
      end_date: movieData.end_date ? new Date(movieData.end_date).toISOString() : null,
    }
    const { data } = await api.post<MovieWithSessionsOut>('/logging/movies', movieDataWithDates)
    return mapMovieWithSessionsToMovieLog(data)
  },

  createWatchlist: async (data: {
    title: string
    director?: string
    year?: number
    genre?: string
    posterImage?: string
    externalId?: string
  }): Promise<MovieLog> => {
    const movieData = {
      title: data.title,
      director: data.director || undefined,
      year: data.year || undefined,
      genre: data.genre || undefined,
      posterImage: data.posterImage || undefined,
      externalId: data.externalId || undefined,
      status: 'paused' as const,
      startDate: new Date().toISOString(),
      isWatchlist: true,
      isRewatch: false,
    }
    const { data: response } = await api.post<MovieWithSessionsOut>('/logging/movies', movieData)
    return mapMovieWithSessionsToMovieLog(response)
  },

  update: async (id: string, movie: MovieSchemaData): Promise<MovieLog> => {
    const movieData = convertFormDataToMovieCreate(movie)
    const movieDataWithDates = {
      ...movieData,
      start_date: new Date(movieData.start_date).toISOString(),
      end_date: movieData.end_date ? new Date(movieData.end_date).toISOString() : null,
    }
    const { data } = await api.put<MovieWithSessionsOut>(`/logging/movies/${id}`, movieDataWithDates)
    return mapMovieWithSessionsToMovieLog(data)
  },

  startRewatch: async (id: string, movie: MovieSchemaData): Promise<MovieLog> => {
    const movieData = convertFormDataToMovieCreate(movie)
    const movieDataWithDates = {
      ...movieData,
      start_date: new Date(movieData.start_date).toISOString(),
      end_date: movieData.end_date ? new Date(movieData.end_date).toISOString() : null,
    }
    const { data } = await api.post<MovieWithSessionsOut>(`/logging/movies/${id}/rewatch`, movieDataWithDates)
    return mapMovieWithSessionsToMovieLog(data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/logging/movies/${id}`)
  },

  getStats: async (): Promise<MovieStats> => {
    const { data } = await api.get<MovieStats>('/logging/movies/stats')
    return data
  },

  checkExists: async (title: string): Promise<{ exists: boolean; title: string; status?: string; public_id?: string }> => {
    const { data } = await api.get('/logging/movies/check-exists', { params: { title } })
    return data
  },

  toggleFavorite: async (id: string, isFavorite: boolean): Promise<{ message: string; is_favorite: boolean }> => {
    const { data } = await api.patch(`/logging/movies/${id}/favorite`, null, { params: { is_favorite: isFavorite } })
    return data
  },

  toggleWatchlist: async (id: string, isWatchlist: boolean): Promise<{ message: string; is_watchlist: boolean }> => {
    const { data } = await api.patch(`/logging/movies/${id}/watchlist`, null, { params: { is_watchlist: isWatchlist } })
    return data
  },

  getSessionComments: async (sessionId: string) => {
    const { data } = await api.get<BackendCommentOut[]>(`/logging/sessions/${sessionId}/comments`)
    return data.map((c) => ({
      public_id: c.public_id,
      timestamp: c.timestamp ?? 0,
      duration: c.chapter_or_episode != null ? Number(c.chapter_or_episode) || undefined : undefined,
      text: c.content,
    }))
  }
}
