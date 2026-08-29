import { useCallback, useState, useMemo } from 'react'
import { useAddMovieModal } from '../../../shared/hooks/useAddMovieModal'
import { useMovieActions } from '../../../shared/hooks/useMovieActions'
import { 
  useMoviesQuery,
  useMovieStatsQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useStartRewatchMutation,
  useCreateWatchlistMovieMutation, 
  useToggleFavoriteMutation, 
  useToggleWatchlistMutation 
} from './useMovieQueries'
import type { MovieLog, PaginationParams } from '../types/movie'
import type { MovieSchemaData } from '../schemas/movieSchema'
import { useFilterModal } from '../../../shared/hooks/useFilterModal'
import type { FilterOptions } from '../../../shared/components/modals/FilterModalContent'
import { useAddToWatchlistModal } from '../../../shared/hooks/useAddToWatchlistModal'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'
import { useSettings } from '../../../shared/hooks/useSettings'
import { useSearchParamsState } from '../../../shared/hooks/useSearchParamsState'
import { toast } from 'sonner'
import type { MoviePageConfig } from '../types/page'
import { movieService } from '../../../services/movieService'

export function useMoviesPageController(args: { pathname: string; pageConfig: MoviePageConfig }) {
  const { pageConfig } = args
  const { settings } = useSettings()

  const [urlParams, setUrlParams] = useSearchParamsState<PaginationParams>({
    page: 1,
    page_size: settings.items_per_page || 12,
    sort_by: pageConfig.defaultSort || 'updated_at',
    sort_order: 'desc',
    search: '',
    ...pageConfig.defaultFilters,
  })

  const { data, isLoading, error } = useMoviesQuery(urlParams)
  const { data: stats } = useMovieStatsQuery()
  
  const { openAddMovieModal } = useAddMovieModal()
  const { openAddCommentsModal, openMovieHistoryModal } = useMovieActions()
  const { openFilterModal } = useFilterModal()
  const { openAddToWatchlistModal } = useAddToWatchlistModal()
  
  const createMovieMutation = useCreateMovieMutation()
  const updateMovieMutation = useUpdateMovieMutation()
  const deleteMovieMutation = useDeleteMovieMutation()
  const startRewatchMutation = useStartRewatchMutation()
  const createWatchlistMovieMutation = useCreateWatchlistMovieMutation()
  const toggleFavoriteMutation = useToggleFavoriteMutation()
  const toggleWatchlistMutation = useToggleWatchlistMutation()
  const { confirm } = useConfirmation()

  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('tiles')
  const [selectedMovies, setSelectedMovies] = useState<MovieLog[]>([])

  const handleAddMovie = useCallback(async (movieData: MovieSchemaData) => {
    await createMovieMutation.mutateAsync(movieData)
  }, [createMovieMutation])

  const openAddMovie = useCallback(() => {
    openAddMovieModal(handleAddMovie)
  }, [handleAddMovie, openAddMovieModal])

  const handleEditMovie = useCallback((movie: MovieLog) => {
    openAddMovieModal(
      async (movieData: MovieSchemaData) => {
        await updateMovieMutation.mutateAsync({ movieId: movie.id, movieData })
      },
      movie,
      'edit',
      async (movieId: string) => {
        await deleteMovieMutation.mutateAsync(movieId)
      }
    )
  }, [updateMovieMutation, deleteMovieMutation, openAddMovieModal])

  const handleDeleteMovie = useCallback((movieId: string) => {
    confirm({
      title: 'Delete Movie',
      message: 'Are you sure you want to delete this movie? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteMovieMutation.mutateAsync(movieId)
      },
    })
  }, [confirm, deleteMovieMutation])

  const handleRewatchMovie = useCallback((movie: MovieLog) => {
    openAddMovieModal(async (movieData: MovieSchemaData) => {
      await startRewatchMutation.mutateAsync({
        movieId: movie.id,
        movieData: {
          ...movieData,
          is_rewatch: true,
          status: movieData.status || 'rewatching',
        },
      })
    }, movie, 'rewatch')
  }, [startRewatchMutation, openAddMovieModal])

  const handleAddComments = useCallback(async (movie: MovieLog) => {
    try {
      const movieData = await movieService.getMovieSessionsWithComments(movie.id)
      const sessions = movieData.sessions
      const currentSession = sessions[sessions.length - 1]

      if (!currentSession) {
        toast.error('No active session found for this movie')
        return
      }

      openAddCommentsModal(movie, currentSession.sessionId, currentSession.comments)
    } catch (err) {
      toast.error('Failed to load movie session details')
    }
  }, [openAddCommentsModal])

  const handleViewHistory = useCallback((movie: MovieLog) => {
    openMovieHistoryModal(movie.id)
  }, [openMovieHistoryModal])

  const handleMarkCompleted = useCallback((movie: MovieLog) => {
    openAddMovieModal(async (movieData: MovieSchemaData) => {
      await updateMovieMutation.mutateAsync({
        movieId: movie.id,
        movieData: {
          ...movieData,
          status: 'completed',
          end_date: movieData.end_date || new Date().toISOString().slice(0, 16),
        }
      })
    }, { ...movie, status: 'completed' } as unknown as MovieLog)
  }, [updateMovieMutation, openAddMovieModal])

  const handleAddToWatchlist = useCallback(() => {
    openAddToWatchlistModal(async (data) => {
      await createWatchlistMovieMutation.mutateAsync(data)
    })
  }, [createWatchlistMovieMutation, openAddToWatchlistModal])

  const handleToggleFavorite = useCallback(async (movie: MovieLog) => {
    await toggleFavoriteMutation.mutateAsync({
      movieId: movie.id,
      isFavorite: !movie.is_favorite,
    })
  }, [toggleFavoriteMutation])

  const handleToggleWatchlist = useCallback(async (movie: MovieLog) => {
    await toggleWatchlistMutation.mutateAsync({
      movieId: movie.id,
      isWatchlist: !movie.is_watchlist,
    })
  }, [toggleWatchlistMutation])

  const handleBulkDelete = useCallback(async () => {
    if (selectedMovies.length === 0) return

    confirm({
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedMovies.length} movies? This action cannot be undone.`,
      confirmText: 'Delete All',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(selectedMovies.map(movie => deleteMovieMutation.mutateAsync(movie.id)))
          setSelectedMovies([])
          toast.success(`Successfully deleted ${selectedMovies.length} movies`)
        } catch (error) {
          toast.error('Failed to delete some movies')
        }
      }
    })
  }, [confirm, deleteMovieMutation, selectedMovies])

  const handleClearSelection = useCallback(() => {
    setSelectedMovies([])
  }, [])

  const handleOpenFilterModal = useCallback(() => {
    openFilterModal(
      (filterOptions) => {
        const newFilters: any = {
          status: filterOptions.status,
          director: filterOptions.director,
          genre: filterOptions.genre,
          platform: filterOptions.platform,
          year_min: filterOptions.yearReleased?.min,
          year_max: filterOptions.yearReleased?.max,
          rating_min: filterOptions.rating?.min,
          rating_max: filterOptions.rating?.max,
          page: 1,
        }
        setUrlParams(newFilters)
      },
      {
        status: urlParams.status,
        director: urlParams.director,
        genre: urlParams.genre,
        platform: urlParams.platform,
        yearReleased: { min: urlParams.year_min, max: urlParams.year_max },
        rating: { min: urlParams.rating_min, max: urlParams.rating_max },
      }
    )
  }, [urlParams, setUrlParams, openFilterModal])

  const activeFiltersCount = useMemo(() => {
    const keys = ['status', 'director', 'genre', 'platform', 'year_min', 'year_max', 'rating_min', 'rating_max']
    return keys.filter(key => urlParams[key as keyof PaginationParams] !== undefined).length
  }, [urlParams])

  return {
    pageConfig,
    settings,
    viewMode,
    setViewMode,
    activeFilters: urlParams,
    activeFiltersCount,
    selectedMovies,
    setSelectedMovies,
    openAddMovie,
    handleEditMovie,
    handleDeleteMovie,
    handleRewatchMovie,
    handleAddComments,
    handleViewHistory,
    handleMarkCompleted,
    handleAddToWatchlist,
    handleToggleFavorite,
    handleToggleWatchlist,
    handleOpenFilterModal,
    handleBulkDelete,
    handleClearSelection,
    movies: data?.items || [],
    loading: isLoading,
    error: error?.message,
    page: urlParams.page || 1,
    totalPages: data?.total_pages || 1,
    hasNext: data?.has_next || false,
    hasPrev: data?.has_prev || false,
    search: urlParams.search || '',
    sortBy: urlParams.sort_by || 'updated_at',
    sortOrder: urlParams.sort_order || 'desc',
    stats,
    setPage: (page: number) => setUrlParams({ page }),
    setSearch: (search: string) => setUrlParams({ search, page: 1 }),
    setSortBy: (sort_by: string) => setUrlParams({ sort_by }),
    setSortOrder: (sort_order: 'asc' | 'desc') => setUrlParams({ sort_order }),
  }
}

export type MoviesPageController = ReturnType<typeof useMoviesPageController>
