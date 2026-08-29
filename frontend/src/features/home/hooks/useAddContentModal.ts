import { useCallback } from 'react'
import { useAddMovieModal } from '../../../shared/hooks/useAddMovieModal'
import { useAddToWatchlistModal } from '../../../shared/hooks/useAddToWatchlistModal'
import { useAddSeriesModal } from '../../series/hooks/useAddSeriesModal'
import type { MovieSchemaData } from '../../movies/schemas/movieSchema'
import type { WatchlistMovieData } from '../../../shared/components/modals/AddToWatchlistModalContent'
import { toast } from 'sonner'
import { useModal } from '../../../shared/hooks/useModal'
import { AddContentModalContent } from '../components/modals/AddContentModalContent'

type ContentSelectorMode = 'add' | 'watchlist'

export function useAddContentModal() {
  const { openModal, closeModal } = useModal()
  const { openAddMovieModal } = useAddMovieModal()
  const { openAddToWatchlistModal } = useAddToWatchlistModal()
  const { openAddSeriesModal } = useAddSeriesModal()

  const handleSelectMovie = useCallback((onSubmit: (movie: MovieSchemaData) => Promise<void>) => {
    openAddMovieModal(onSubmit)
  }, [openAddMovieModal])

  const handleSelectMovieWatchlist = useCallback((onSubmit: (data: WatchlistMovieData) => Promise<void>) => {
    openAddToWatchlistModal(onSubmit, 'movie')
  }, [openAddToWatchlistModal])

  const handleSelectSeries = useCallback((onSubmit: (data: any) => Promise<void>) => {
    openAddSeriesModal(onSubmit)
  }, [openAddSeriesModal])

  const handleSelectSeriesWatchlist = useCallback((onSubmit: (data: WatchlistMovieData) => Promise<void>) => {
    openAddToWatchlistModal(onSubmit, 'series')
  }, [openAddToWatchlistModal])

  const handleSelectBook = useCallback(() => {
    toast.info('Book tracking coming soon!', { icon: '📚' })
  }, [])

  const openContentSelector = useCallback((
    mode: ContentSelectorMode = 'add',
    onSelectMovie: () => void,
    onSelectSeries: () => void,
    onSelectBook: () => void
  ) => {
    openModal({
      id: 'add-content-selector',
      content: AddContentModalContent,
      props: {
        mode,
        onSelectMovie,
        onSelectSeries,
        onSelectBook,
        onClose: () => closeModal('add-content-selector'),
      },
      size: 'lg',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return {
    openContentSelector,
    handleSelectMovie,
    handleSelectMovieWatchlist,
    handleSelectSeries,
    handleSelectSeriesWatchlist,
    handleSelectBook,
  }
}
