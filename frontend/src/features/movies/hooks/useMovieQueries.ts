import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { movieService } from '../../../services/movieService'
import { useGenericQuery, useGenericDetailQuery } from '../../../shared/hooks/useGenericQuery'
import {
  useGenericCreateMutation,
  useGenericUpdateMutation,
  useGenericDeleteMutation,
} from '../../../shared/hooks/useGenericMutation'
import type { PaginationParams } from '../types/movie'
import type { MovieSchemaData } from '../schemas/movieSchema'
import { api } from '../../../app/api'

export const movieKeys = {
  all: ['movies'] as const,
  lists: () => [...movieKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...movieKeys.lists(), params] as const,
  details: () => [...movieKeys.all, 'detail'] as const,
  detail: (id: string) => [...movieKeys.details(), id] as const,
  stats: () => [...movieKeys.all, 'stats'] as const,
}

export function useMoviesQuery(params: PaginationParams) {
  return useGenericQuery(movieService, params, {
    queryKey: movieKeys.list(params) as any,
  })
}

export function useMovieQuery(movieId: string) {
  return useGenericDetailQuery(movieService, movieId, {
    queryKey: movieKeys.detail(movieId) as any,
  })
}

export function useMovieStatsQuery() {
  return useQuery({
    queryKey: movieKeys.stats(),
    queryFn: () => movieService.getStats(),
  })
}

export function useMovieSessionsWithCommentsQuery(movieId: string, enabled = true) {
  return useQuery({
    queryKey: [...movieKeys.detail(movieId), 'sessions', 'comments'],
    queryFn: () => movieService.getMovieSessionsWithComments(movieId),
    enabled: enabled && !!movieId,
  })
}

export function useCreateMovieMutation() {
  const queryClient = useQueryClient()
  return useGenericCreateMutation(movieService, {
    successMessage: 'Movie added successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
    },
  })
}

export function useCreateWatchlistMovieMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => movieService.createWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
      toast.success('Added to watchlist')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add to watchlist')
    },
  })
}

export function useUpdateMovieMutation() {
  const queryClient = useQueryClient()
  return useGenericUpdateMutation(movieService, {
    successMessage: 'Movie updated successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
    },
  })
}

export function useDeleteMovieMutation() {
  const queryClient = useQueryClient()
  return useGenericDeleteMutation(movieService, {
    successMessage: 'Movie deleted successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.stats() })
    },
  })
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ movieId, isFavorite }: { movieId: string; isFavorite: boolean }) =>
      movieService.toggleFavorite(movieId, isFavorite),
    onSuccess: (_, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(movieId) })
      toast.success('Favorite status updated')
    },
  })
}

export function useToggleWatchlistMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ movieId, isWatchlist }: { movieId: string; isWatchlist: boolean }) =>
      movieService.toggleWatchlist(movieId, isWatchlist),
    onSuccess: (_, { movieId }) => {
      queryClient.invalidateQueries({ queryKey: movieKeys.lists() })
      queryClient.invalidateQueries({ queryKey: movieKeys.detail(movieId) })
      toast.success('Watchlist status updated')
    },
  })
}

// Keep existing complex/specialized hooks
export function useStartRewatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ movieId, movieData }: { movieId: string; movieData: MovieSchemaData }) => {
      const response = await api.post(`/logging/movies/${movieId}/rewatch`, movieData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movieKeys.all })
      toast.success('Rewatch started successfully')
    },
  })
}

export function useSessionCommentsQuery(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'comments'],
    queryFn: async () => {
      const response = await api.get(`/logging/sessions/${sessionId}/comments`)
      return response.data.map((c: any) => ({
        public_id: c.public_id,
        timestamp: c.timestamp ?? 0,
        duration: c.chapter_or_episode != null ? Number(c.chapter_or_episode) || undefined : undefined,
        text: c.content,
      }))
    },
    enabled: !!sessionId,
  })
}

export function useMovieWithSessionsQuery(movieId: string, enabled = true) {
  return useQuery({
    queryKey: [...movieKeys.detail(movieId), 'sessions'],
    queryFn: async () => {
      const response = await api.get(`/logging/movies/${movieId}`)
      return response.data
    },
    enabled: enabled && !!movieId,
  })
}
