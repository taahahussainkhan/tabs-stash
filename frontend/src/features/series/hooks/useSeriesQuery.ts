import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { seriesApi } from '../api/seriesApi'
import type { MovieSchemaData } from '../../movies/schemas/movieSchema'
import type { PaginationParams } from '../types/series'

export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...seriesKeys.lists(), params] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...seriesKeys.details(), id] as const,
  stats: () => [...seriesKeys.all, 'stats'] as const,
}

export function useSeriesQuery(params: PaginationParams) {
  return useQuery({
    queryKey: seriesKeys.list(params),
    queryFn: () => seriesApi.getAll(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useSeriesStatsQuery() {
  return useQuery({
    queryKey: seriesKeys.stats(),
    queryFn: () => seriesApi.getStats(),
  })
}

export function useSeriesWithSessionsQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: [...seriesKeys.detail(id), 'sessions'],
    queryFn: () => seriesApi.getWithSessions(id),
    enabled: enabled && !!id,
  })
}

export function useSeriesSessionsWithCommentsQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: [...seriesKeys.detail(id), 'sessions', 'comments'],
    queryFn: () => seriesApi.getSessionsWithComments(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCreateSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seriesData: MovieSchemaData) => seriesApi.create(seriesData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      toast.success('Series added successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add series')
    },
  })
}

export function useCreateWatchlistSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { title: string; creator?: string; year?: number; genre?: string }) =>
      seriesApi.createWatchlist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      toast.success('Series added to watchlist')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to add to watchlist')
    },
  })
}

export function useUpdateSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MovieSchemaData }) =>
      seriesApi.update(id, data),
    onSuccess: (updatedSeries) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      queryClient.setQueryData(seriesKeys.detail(updatedSeries.public_id), updatedSeries)
      toast.success('Series updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update series')
    },
  })
}

export function useDeleteSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => seriesApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      queryClient.removeQueries({ queryKey: seriesKeys.detail(id) })
      toast.success('Series deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete series')
    },
  })
}

export function useStartRewatchSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MovieSchemaData }) =>
      seriesApi.startRewatch(id, data),
    onSuccess: (updatedSeries) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      queryClient.setQueryData(seriesKeys.detail(updatedSeries.public_id), updatedSeries)
      toast.success('Rewatch started successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to start rewatch')
    },
  })
}

export function useToggleFavoriteSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      seriesApi.toggleFavorite(id, isFavorite),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(id) })
      toast.success('Favorite status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update favorite status')
    },
  })
}

export function useToggleWatchlistSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isWatchlist }: { id: string; isWatchlist: boolean }) =>
      seriesApi.toggleWatchlist(id, isWatchlist),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(id) })
      toast.success('Watchlist status updated')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update watchlist status')
    },
  })
}
