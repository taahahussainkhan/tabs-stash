import { useState, useMemo } from 'react'
import type { PaginationParams } from '../types/series'
import {
  useSeriesQuery,
  useSeriesStatsQuery,
  useCreateSeriesMutation,
  useUpdateSeriesMutation,
  useDeleteSeriesMutation,
  useStartRewatchSeriesMutation,
} from './useSeriesQuery'

export function useSeries() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Partial<PaginationParams>>({})

  // Build query params
  const queryParams = useMemo<PaginationParams>(
    () => ({
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
      search: search || undefined,
      ...filters,
    }),
    [page, pageSize, sortBy, sortOrder, search, filters]
  )

  // Queries
  const seriesQuery = useSeriesQuery(queryParams)
  const statsQuery = useSeriesStatsQuery()

  // Mutations
  const createSeriesMutation = useCreateSeriesMutation()
  const updateSeriesMutation = useUpdateSeriesMutation()
  const deleteSeriesMutation = useDeleteSeriesMutation()
  const startRewatchMutation = useStartRewatchSeriesMutation()

  return {
    // Data
    series: seriesQuery.data?.items ?? [],
    total: seriesQuery.data?.total ?? 0,
    totalPages: seriesQuery.data?.total_pages ?? 0,
    hasNext: seriesQuery.data?.has_next ?? false,
    hasPrev: seriesQuery.data?.has_prev ?? false,
    stats: statsQuery.data,

    // Loading states
    loading: seriesQuery.isLoading,
    isRefetching: seriesQuery.isRefetching,
    statsLoading: statsQuery.isLoading,

    // Error states
    error: seriesQuery.error ? 'Failed to load series' : null,
    statsError: statsQuery.error ? 'Failed to load stats' : null,

    // Pagination & filters
    page,
    pageSize,
    sortBy,
    sortOrder,
    search,
    filters,
    setPage,
    setSortBy,
    setSortOrder,
    setSearch,
    setFilters,

    // Mutations
    createSeries: createSeriesMutation.mutateAsync,
    updateSeries: (id: string, data: any) =>
      updateSeriesMutation.mutateAsync({ id, data }),
    deleteSeries: deleteSeriesMutation.mutateAsync,
    startRewatch: (id: string, data: any) =>
      startRewatchMutation.mutateAsync({ id, data }),

    // Mutation states
    isCreating: createSeriesMutation.isPending,
    isUpdating: updateSeriesMutation.isPending,
    isDeleting: deleteSeriesMutation.isPending,

    // Refetch
    refetch: seriesQuery.refetch,
    refetchStats: statsQuery.refetch,
  }
}
