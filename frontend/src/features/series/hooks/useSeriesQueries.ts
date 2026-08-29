import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { seriesService } from '../../../services/seriesService'
import { useGenericQuery, useGenericDetailQuery } from '../../../shared/hooks/useGenericQuery'
import {
  useGenericCreateMutation,
  useGenericUpdateMutation,
  useGenericDeleteMutation,
} from '../../../shared/hooks/useGenericMutation'
import type { PaginationParams, SeriesLogCreate } from '../types/series'
import type { MovieSchemaData } from '../../movies/schemas/movieSchema'
import { api } from '../../../app/api'

export const seriesKeys = {
  all: ['series'] as const,
  lists: () => [...seriesKeys.all, 'list'] as const,
  list: (params: PaginationParams) => [...seriesKeys.lists(), params] as const,
  details: () => [...seriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...seriesKeys.details(), id] as const,
  stats: () => [...seriesKeys.all, 'stats'] as const,
}

export function useSeriesQuery(params: PaginationParams) {
  return useGenericQuery(seriesService, params, {
    queryKey: seriesKeys.list(params) as any,
  })
}

export function useSeriesDetailQuery(seriesId: string) {
  return useGenericDetailQuery(seriesService, seriesId, {
    queryKey: seriesKeys.detail(seriesId) as any,
  })
}

export function useSeriesStatsQuery() {
  return useQuery({
    queryKey: seriesKeys.stats(),
    queryFn: () => seriesService.getStats(),
  })
}

export function useSeriesSessionsWithCommentsQuery(seriesId: string, enabled = true) {
  return useQuery({
    queryKey: [...seriesKeys.detail(seriesId), 'sessions', 'comments'],
    queryFn: () => seriesService.getSeriesSessionsWithComments(seriesId),
    enabled: enabled && !!seriesId,
  })
}

export function useCreateSeriesMutation() {
  const queryClient = useQueryClient()
  return useGenericCreateMutation(seriesService, {
    successMessage: 'Series added successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
    },
  })
}

export function useCreateWatchlistSeriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; creator?: string; year?: number; genre?: string }) =>
      seriesService.createWatchlistSeries(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
      toast.success('Series added to watchlist')
    },
  })
}

export function useUpdateSeriesMutation() {
  const queryClient = useQueryClient()
  return useGenericUpdateMutation(seriesService, {
    successMessage: 'Series updated successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
    },
  })
}

export function useDeleteSeriesMutation() {
  const queryClient = useQueryClient()
  return useGenericDeleteMutation(seriesService, {
    successMessage: 'Series deleted successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.stats() })
    },
  })
}

export function useToggleFavoriteSeriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ seriesId, isFavorite }: { seriesId: string; isFavorite: boolean }) =>
      seriesService.toggleFavorite(seriesId, isFavorite),
    onSuccess: (_, { seriesId }) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(seriesId) })
      toast.success('Favorite status updated')
    },
  })
}

export function useToggleWatchlistSeriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ seriesId, isWatchlist }: { seriesId: string; isWatchlist: boolean }) =>
      seriesService.toggleWatchlist(seriesId, isWatchlist),
    onSuccess: (_, { seriesId }) => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(seriesId) })
      toast.success('Watchlist status updated')
    },
  })
}

export function useStartRewatchSeriesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ seriesId, seriesData }: { seriesId: string; seriesData: MovieSchemaData }) => {
      const response = await api.post(`/logging/series/${seriesId}/rewatch`, seriesData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.all })
      toast.success('Rewatch started successfully')
    },
  })
}

export function useSeriesWithSessionsQuery(seriesId: string, enabled = true) {
  return useQuery({
    queryKey: [...seriesKeys.detail(seriesId), 'sessions'],
    queryFn: async () => {
      const response = await api.get(`/logging/series/${seriesId}`)
      return response.data
    },
    enabled: enabled && !!seriesId,
  })
}
