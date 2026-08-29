import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { AddSeriesModalContent } from '../components/modals/AddSeriesModalContent'
import type { SeasonStructure } from '../types/series'

export function useAddSeriesModal() {
  const { openModal, closeModal } = useModal()

  const openAddSeriesModal = useCallback((
    onSubmit: (data: {
      title: string
      creator?: string
      year?: number
      genre?: string
      seasons: SeasonStructure[]
    }) => Promise<void>
  ) => {
    openModal({
      id: 'add-series-modal',
      title: 'Add New Series',
      content: AddSeriesModalContent,
      props: {
        onSubmit,
        onClose: () => closeModal('add-series-modal'),
      },
      size: 'xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openAddSeriesModal }
}
