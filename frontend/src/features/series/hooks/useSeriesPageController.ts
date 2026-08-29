import { useCallback, useState, useMemo } from 'react'
import { useAddMovieModal } from '../../../shared/hooks/useAddMovieModal'
import { useMovieActions } from '../../../shared/hooks/useMovieActions'
import { 
  useSeriesQuery, 
  useSeriesStatsQuery, 
  useCreateSeriesMutation, 
  useUpdateSeriesMutation, 
  useDeleteSeriesMutation, 
  useStartRewatchSeriesMutation,
  useCreateWatchlistSeriesMutation, 
  useToggleFavoriteSeriesMutation, 
  useToggleWatchlistSeriesMutation 
} from './useSeriesQueries'
import type { SeriesLog, PaginationParams } from '../types/series'
import type { MovieSchemaData } from '../../movies/schemas/movieSchema'
import { useFilterModal } from '../../../shared/hooks/useFilterModal'
import type { FilterOptions } from '../../../shared/components/modals/FilterModalContent'
import { useAddToWatchlistModal } from '../../../shared/hooks/useAddToWatchlistModal'
import { useSettings } from '../../../shared/hooks/useSettings'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'
import { useSearchParamsState } from '../../../shared/hooks/useSearchParamsState'
import { useAddSeriesModal } from './useAddSeriesModal'
import { seriesService } from '../../../services/seriesService'
import { toast } from 'sonner'

type PageConfig = {
  title: string
  description: string
  icon: any
  defaultFilters: any
  defaultSort: string
}

export function useSeriesPageController(args: { pathname: string; pageConfig: PageConfig }) {
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

  const { data, isLoading, error } = useSeriesQuery(urlParams)
  const { data: stats } = useSeriesStatsQuery()

  const { openAddMovieModal } = useAddMovieModal()
  const { openAddSeriesModal } = useAddSeriesModal()
  const { openAddCommentsModal, openMovieHistoryModal } = useMovieActions()
  const { openFilterModal } = useFilterModal()
  const { openAddToWatchlistModal } = useAddToWatchlistModal()
  
  const createSeriesMutation = useCreateSeriesMutation()
  const updateSeriesMutation = useUpdateSeriesMutation()
  const deleteSeriesMutation = useDeleteSeriesMutation()
  const startRewatchMutation = useStartRewatchSeriesMutation()
  const createWatchlistSeriesMutation = useCreateWatchlistSeriesMutation()
  const toggleFavoriteMutation = useToggleFavoriteSeriesMutation()
  const toggleWatchlistMutation = useToggleWatchlistSeriesMutation()
  const { confirm } = useConfirmation()

  const [viewMode, setViewMode] = useState<'tiles' | 'table'>('tiles')

  const handleAddSeries = useCallback(async (seriesData: MovieSchemaData) => {
    await createSeriesMutation.mutateAsync(seriesData)
  }, [createSeriesMutation])

  const openAddSeries = useCallback(() => {
    openAddMovieModal(handleAddSeries, undefined, undefined, undefined, 'series')
  }, [handleAddSeries, openAddMovieModal])

  const handleAddSeriesWithStructure = useCallback(async (data: {
    title: string
    creator?: string
    year?: number
    genre?: string
    seasons: Array<{ season_number: number; episode_count: number; title?: string; year?: number }>
  }) => {
    await createSeriesMutation.mutateAsync({
      title: data.title,
      creator: data.creator,
      year: data.year,
      genre: data.genre,
      status: 'watching',
      start_date: new Date().toISOString().slice(0, 16),
      is_rewatch: false,
      seasons: data.seasons,
    } as any)
  }, [createSeriesMutation])

  const openAddSeriesWithStructure = useCallback(() => {
    openAddSeriesModal(handleAddSeriesWithStructure)
  }, [handleAddSeriesWithStructure, openAddSeriesModal])

  const handleEditSeries = useCallback((seriesItem: SeriesLog) => {
    openAddMovieModal(
      async (seriesData: MovieSchemaData) => {
        await updateSeriesMutation.mutateAsync({ id: seriesItem.id, data: seriesData })
      },
      {
        ...seriesItem,
        director: seriesItem.creator,
      },
      'edit',
      async (seriesId: string) => {
        await deleteSeriesMutation.mutateAsync(seriesId)
      },
      'series'
    )
  }, [openAddMovieModal, updateSeriesMutation, deleteSeriesMutation])

  const handleDeleteSeries = useCallback((seriesId: string) => {
    confirm({
      title: 'Delete Series',
      message: 'Are you sure you want to delete this series? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await deleteSeriesMutation.mutateAsync(seriesId)
      },
    })
  }, [confirm, deleteSeriesMutation])

  const handleRewatchSeries = useCallback((seriesItem: SeriesLog) => {
    openAddMovieModal(async (seriesData: MovieSchemaData) => {
      await startRewatchMutation.mutateAsync({
        seriesId: seriesItem.id,
        seriesData: {
          ...seriesData,
          is_rewatch: true,
          status: seriesData.status || 'rewatching',
        },
      })
    }, {
      ...seriesItem,
      director: seriesItem.creator,
    }, 'rewatch', undefined, 'series')
  }, [openAddMovieModal, startRewatchMutation])

  const handleAddComments = useCallback(async (seriesItem: SeriesLog) => {
    try {
      const seriesData = await seriesService.getSeriesSessionsWithComments(seriesItem.id)
      const sessions = seriesData.sessions
      const currentSession = sessions[sessions.length - 1]

      if (!currentSession) {
        toast.error('No active session found for this series')
        return
      }

      openAddCommentsModal({
        ...seriesItem,
        director: seriesItem.creator,
      }, currentSession.sessionId, currentSession.comments)
    } catch (err) {
      toast.error('Failed to load series session details')
    }
  }, [openAddCommentsModal])

  const handleViewHistory = useCallback((seriesItem: SeriesLog) => {
    openMovieHistoryModal(seriesItem.id)
  }, [openMovieHistoryModal])

  const handleMarkCompleted = useCallback((seriesItem: SeriesLog) => {
    openAddMovieModal(async (seriesData: MovieSchemaData) => {
      await updateSeriesMutation.mutateAsync({
        id: seriesItem.id,
        data: {
          ...seriesData,
          status: 'completed',
          end_date: seriesData.end_date || new Date().toISOString().slice(0, 16),
        }
      })
    }, {
      ...seriesItem,
      director: seriesItem.creator,
      status: 'completed'
    }, undefined, undefined, 'series')
  }, [openAddMovieModal, updateSeriesMutation])

  const handleAddToWatchlist = useCallback(() => {
    openAddToWatchlistModal(async (data) => {
      await createWatchlistSeriesMutation.mutateAsync(data)
    }, 'series')
  }, [createWatchlistSeriesMutation, openAddToWatchlistModal])

  const handleToggleFavorite = useCallback(async (seriesItem: SeriesLog) => {
    await toggleFavoriteMutation.mutateAsync({
      seriesId: seriesItem.id,
      isFavorite: !seriesItem.is_favorite,
    })
  }, [toggleFavoriteMutation])

  const handleToggleWatchlist = useCallback(async (seriesItem: SeriesLog) => {
    await toggleWatchlistMutation.mutateAsync({
      seriesId: seriesItem.id,
      isWatchlist: !seriesItem.is_watchlist,
    })
  }, [toggleWatchlistMutation])

  const handleOpenFilterModal = useCallback(() => {
    openFilterModal(
      (filterOptions) => {
        const newFilters: any = {
          status: filterOptions.status,
          creator: filterOptions.director,
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
        director: urlParams.creator,
        genre: urlParams.genre,
        platform: urlParams.platform,
        yearReleased: { min: urlParams.year_min, max: urlParams.year_max },
        rating: { min: urlParams.rating_min, max: urlParams.rating_max },
      },
      'series'
    )
  }, [urlParams, setUrlParams, openFilterModal])

  const activeFiltersCount = useMemo(() => {
    const keys = ['status', 'creator', 'genre', 'platform', 'year_min', 'year_max', 'rating_min', 'rating_max']
    return keys.filter(key => urlParams[key as keyof PaginationParams] !== undefined).length
  }, [urlParams])

  return {
    pageConfig,
    settings,
    viewMode,
    setViewMode,
    activeFilters: urlParams,
    activeFiltersCount,
    openAddSeries,
    openAddSeriesWithStructure,
    handleAddSeries,
    handleAddSeriesWithStructure,
    handleEditSeries,
    handleDeleteSeries,
    handleRewatchSeries,
    handleAddComments,
    handleViewHistory,
    handleMarkCompleted,
    handleAddToWatchlist,
    handleToggleFavorite,
    handleToggleWatchlist,
    handleOpenFilterModal,
    series: data?.items || [],
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

export type SeriesPageController = ReturnType<typeof useSeriesPageController>
