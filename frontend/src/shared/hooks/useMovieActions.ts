import { useCallback } from 'react'
import { useModal } from './useModal'
import { UpdateProgressModalContent } from '../../features/movies/components/UpdateProgressModalContent'
import { AddCommentsModalContent } from '../../features/movies/components/AddCommentsModalContent'
import { MovieHistoryModalContent } from '../../features/movies/components/MovieHistoryModalContent'
import type { MovieLog } from '../../features/movies/types/movie'
import type { CommentData } from '../types/comment'

type ProgressUpdateData = {
  status: 'watching' | 'completed' | 'paused' | 'rewatching'
  current_timestamp?: number | null
  stop_reason?: string
}

export function useMovieActions() {
  const { openModal } = useModal()

  const openUpdateProgressModal = useCallback((
    movie: MovieLog,
    onSubmit: (data: ProgressUpdateData) => Promise<void>
  ) => {
    openModal({
      id: 'update-progress-modal',
      title: 'Update Progress',
      content: UpdateProgressModalContent,
      props: { movie, onSubmit, onClose: () => { } },
      size: 'xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal])

  const openMovieHistoryModal = useCallback((
    movieId: string
  ) => {
    openModal({
      id: 'movie-history-modal',
      title: 'Movie History',
      content: MovieHistoryModalContent,
      props: { movieId, onClose: () => { } },
      size: 'xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal])

  const openAddCommentsModal = useCallback((
    movie: MovieLog,
    sessionId: string,
    existingComments: CommentData[] = []
  ) => {
    openModal({
      id: 'add-comments-modal',
      title: 'Add Comments',
      content: AddCommentsModalContent,
      props: { movie, sessionId, onClose: () => { }, existingComments },
      size: 'xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal])

  return {
    openUpdateProgressModal,
    openAddCommentsModal,
    openMovieHistoryModal,
  }
}
