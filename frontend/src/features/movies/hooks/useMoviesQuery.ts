import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { moviesApi } from '../api/moviesApi'
import type { PaginationParams } from '../types/movie'
import type { MovieSchemaData } from '../schemas/movieSchema'

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...movieKeys.lists(), params] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
  stats: () => [...movieKeys.all, 'stats'] as const,
}

export function useMoviesQuery(params: PaginationParams) {
  return useQuery({
    queryKey: movieKeys.list(params),
    queryFn: () => moviesApi.getMovies(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useMovieQuery(movieId: string) {
  return useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => moviesApi.getMovie(movieId),
    enabled: !!movieId,
  })
}

export function useMovieStatsQuery() {
  return useQuery({
    queryKey: movieKeys.stats(),
    queryFn: () => moviesApi.getStats(),
  })
}

export function useMovieWithSessionsQuery(movieId: string, enabled = true) {
  return useQuery({
    queryKey: [...movieKeys.detail(movieId), 'sessions'],
    queryFn: () => moviesApi.getMovieWithSessions(movieId),
    enabled: enabled && !!movieId,
  })
}

export function useMovieSessionsWithCommentsQuery(movieId: string, enabled = true) {
  return useQuery({
    queryKey: [...movieKeys.detail(movieId), 'sessions', 'comments'],
    queryFn: () => moviesApi.getMovieSessionsWithComments(movieId),
    enabled: enabled && !!movieId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useSessionCommentsQuery(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'comments'],
    queryFn: () => moviesApi.getSessionComments(sessionId),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (movieData: MovieSchemaData) => moviesApi.create(movieData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
      toast.success('Movie added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add movie')
    },
  })
}

export function useCreateWatchlistMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; director?: string; year?: number; genre?: string }) =>
      moviesApi.createWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
      toast.success('Movie added to watchlist')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add to watchlist')
    },
  })
}

export function useUpdateMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ movieId, movieData }: { movieId: string; movieData: MovieSchemaData }) =>
      moviesApi.update(movieId, movieData),
    onSuccess: (updatedMovie) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
      queryClient.setQueryData(movieKeys.detail(updatedMovie.id), updatedMovie)
      toast.success('Movie updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update movie')
    },
  })
}

export function useDeleteMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (movieId: string) => moviesApi.delete(movieId),
    onSuccess: (_, movieId) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
      queryClient.removeQueries({ queryKey: movieKeys.detail(movieId) })
      toast.success('Movie deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete movie')
    },
  })
}

export function useStartRewatchMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ movieId, movieData }: { movieId: string; movieData: MovieSchemaData }) =>
      moviesApi.startRewatch(movieId, movieData),
    onSuccess: (updatedMovie) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
      queryClient.setQueryData(movieKeys.detail(updatedMovie.id), updatedMovie)
      toast.success('Rewatch started successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start rewatch')
    },
  })
}

export function useCheckMovieExistsMutation() {
  return useMutation({
    mutationFn: (title: string) => moviesApi.checkExists(title),
  })
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ movieId, isFavorite }: { movieId: string; isFavorite: boolean }) =>
      moviesApi.toggleFavorite(movieId, isFavorite),
    onSuccess: (_, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(movieId) })
      toast.success('Favorite status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update favorite status')
    },
  })
}

export function useToggleWatchlistMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ movieId, isWatchlist }: { movieId: string; isWatchlist: boolean }) =>
      moviesApi.toggleWatchlist(movieId, isWatchlist),
    onSuccess: (_, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(movieId) })
      toast.success('Watchlist status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update watchlist status')
    },
  })
}
