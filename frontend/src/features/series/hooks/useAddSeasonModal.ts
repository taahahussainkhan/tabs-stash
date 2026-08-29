import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { AddSeasonModalContent } from '../components/modals/AddSeasonModalContent'
import type { SeasonCreate } from '../types/seasonEpisode'

export function useAddSeasonModal() {
  const { openModal, closeModal } = useModal()

  const openAddSeasonModal = useCallback((
    onSubmit: (seasonData: SeasonCreate) => Promise<void>,
    existingSeasonNumbers: number[]
  ) => {
    openModal({
      id: 'add-season-modal',
      title: 'Add New Season',
      content: AddSeasonModalContent,
      props: {
        onSubmit,
        existingSeasonNumbers,
        onClose: () => closeModal('add-season-modal'),
      },
      size: 'md',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openAddSeasonModal }
}
