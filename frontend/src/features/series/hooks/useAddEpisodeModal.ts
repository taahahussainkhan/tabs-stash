import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { AddEpisodeModalContent } from '../components/modals/AddEpisodeModalContent'

export function useAddEpisodeModal() {
  const { openModal, closeModal } = useModal()

  const openAddEpisodeModal = useCallback((
    seasonPublicId: string,
    seriesPublicId: string
  ) => {
    openModal({
      id: 'add-episode-modal',
      title: 'Add Episode',
      content: AddEpisodeModalContent,
      props: {
        seasonPublicId,
        seriesPublicId,
        onClose: () => closeModal('add-episode-modal'),
      },
      size: 'md',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openAddEpisodeModal }
}
