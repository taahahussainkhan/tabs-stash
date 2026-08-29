import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { BulkAddEpisodesModalContent } from '../components/modals/BulkAddEpisodesModalContent'

export function useBulkAddEpisodesModal() {
  const { openModal, closeModal } = useModal()

  const openBulkAddEpisodesModal = useCallback((
    seasonPublicId: string,
    seriesPublicId: string
  ) => {
    openModal({
      id: 'bulk-add-episodes-modal',
      title: 'Bulk Add Episodes',
      content: BulkAddEpisodesModalContent,
      props: {
        seasonPublicId,
        seriesPublicId,
        onClose: () => closeModal('bulk-add-episodes-modal'),
      },
      size: 'md',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openBulkAddEpisodesModal }
}
