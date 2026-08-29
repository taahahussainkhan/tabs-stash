import { useState, useMemo } from 'react'
import type { PaginationParams } from '../types/movie'
import {
  useMoviesQuery,
  useMovieStatsQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useStartRewatchMutation,
} from './useMoviesQuery'

export function useMovies() {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Partial<PaginationParams>>({})

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

  const moviesQuery = useMoviesQuery(queryParams)
  const statsQuery = useMovieStatsQuery()

  const createMovieMutation = useCreateMovieMutation()
  const updateMovieMutation = useUpdateMovieMutation()
  const deleteMovieMutation = useDeleteMovieMutation()
  const startRewatchMutation = useStartRewatchMutation()

  return {
    movies: moviesQuery.data?.items ?? [],
    total: moviesQuery.data?.total ?? 0,
    totalPages: moviesQuery.data?.total_pages ?? 0,
    hasNext: moviesQuery.data?.has_next ?? false,
    hasPrev: moviesQuery.data?.has_prev ?? false,
    stats: statsQuery.data,

    loading: moviesQuery.isLoading,
    isRefetching: moviesQuery.isRefetching,
    statsLoading: statsQuery.isLoading,

    error: moviesQuery.error ? 'Failed to load movies' : null,
    statsError: statsQuery.error ? 'Failed to load stats' : null,

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

    createMovie: createMovieMutation.mutateAsync,
    updateMovie: (id: string, movieData: any) =>
      updateMovieMutation.mutateAsync({ movieId: id, movieData }),
    deleteMovie: deleteMovieMutation.mutateAsync,
    startRewatch: (id: string, movieData: any) =>
      startRewatchMutation.mutateAsync({ movieId: id, movieData }),

    isCreating: createMovieMutation.isPending,
    isUpdating: updateMovieMutation.isPending,
    isDeleting: deleteMovieMutation.isPending,

    refetch: moviesQuery.refetch,
    refetchStats: statsQuery.refetch,
  }
}
