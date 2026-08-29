import { useModal } from './useModal'
import { AddToWatchlistModalContent, type WatchlistMovieData } from '../components/modals/AddToWatchlistModalContent'

export function useAddToWatchlistModal() {
  const { openModal } = useModal()

  const openAddToWatchlistModal = (onSubmit: (data: WatchlistMovieData) => Promise<void>, type: 'movie' | 'series' = 'movie') => {
    const id = type === 'series' ? 'add-series-to-watchlist-modal' : 'add-movie-to-watchlist-modal'
    openModal({
      id,
      title: `Add ${type === 'series' ? 'Series' : 'Movie'} to Watchlist`,
      content: AddToWatchlistModalContent,
        props: {
          onSubmit,
          type,
        },
        size: 'xl',
        position: 'left',
        closable: true,
        backdrop: true,
      })
    }

  return { openAddToWatchlistModal }
}
