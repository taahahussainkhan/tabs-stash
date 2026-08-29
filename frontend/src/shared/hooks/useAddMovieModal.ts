import { useCallback } from 'react'
import { useModal } from './useModal'
import { AddMovieModalContent } from '../components/modals/AddMovieModalContent'
import type { MovieLog } from '../../features/movies/types/movie'
import type { MovieSchemaData } from '../../features/movies/schemas/movieSchema'

export function useAddMovieModal() {
  const { openModal, closeModal } = useModal()

  const openAddMovieModal = useCallback((
    onSubmit: (movie: MovieSchemaData) => Promise<void>,
    editingMovie?: MovieLog,
    mode: 'add' | 'edit' | 'rewatch' = editingMovie ? 'edit' : 'add',
    onDelete?: (movieId: string) => Promise<void>,
    type: 'movie' | 'series' = 'movie',
  ) => {
    const entityName = type === 'series' ? 'Series' : 'Movie'
    openModal({
      id: 'add-movie-modal',
      title: mode === 'rewatch'
        ? `Rewatch ${entityName}`
        : editingMovie
          ? `Edit ${entityName}`
          : `Add New ${entityName}`,
      content: AddMovieModalContent,
      props: {
        onSubmit,
        onDelete,
        onClose: () => closeModal('add-movie-modal'),
        editingMovie,
        mode,
          type,
        },
        size: 'xl',
        position: 'left',
        closable: true,
        backdrop: true,
      })
    }, [openModal, closeModal])

  return { openAddMovieModal }
}
