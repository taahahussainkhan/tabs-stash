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
function mapMovieWithCurrentSessionToMovieLog(item: MovieWithCurrentSessionOut): MovieLog {
  const { movie, current_session } = item

  return {
    id: movie.public_id, // Map public_id to id
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
  const rewatch_count = sessions.reduce(
    (count, s) => count + (s.is_rewatch ? 1 : 0),
    0,
  )
  return mapMovieWithCurrentSessionToMovieLog({ movie, current_session, rewatch_count })
}

function convertFormDataToMovieCreate(formData: MovieSchemaData): MovieLogCreate {
  return {
    title: formData.title,
    director: formData.director || undefined,
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
      start_date: new Date(movieData.start_date).toISOString(),
      end_date: movieData.end_date ? new Date(movieData.end_date).toISOString() : null,
    }
    const { data } = await api.post<MovieWithSessionsOut>('/logging/movies', movieDataWithDates)
    return mapMovieWithSessionsToMovieLog(data)
  },

  createWatchlist: async (data: { title: string; director?: string; year?: number; genre?: string }): Promise<MovieLog> => {
    const movieData = {
      ...data,
      status: 'paused' as const,
      start_date: new Date().toISOString(),
      is_rewatch: false,
    }
    const { data: response } = await api.post<MovieWithSessionsOut>('/logging/movies', movieData)
    
    await api.patch(`/logging/movies/${response.movie.public_id}/watchlist`, null, {
      params: { is_watchlist: true }
    })
    
    const { data: updated } = await api.get<MovieWithSessionsOut>(`/logging/movies/${response.movie.public_id}`)
    return mapMovieWithSessionsToMovieLog(updated)
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
