import { useCallback } from 'react'
import { useModal } from './useModal'
import { FilterModalContent, type FilterOptions } from '../components/modals/FilterModalContent'

export function useFilterModal() {
  const { openModal, closeModal } = useModal()

  const openFilterModal = useCallback((
    onApply: (filters: FilterOptions) => void,
    currentFilters: FilterOptions = {},
    type: 'movie' | 'series' = 'movie'
  ) => {
    openModal({
      id: 'filter-modal',
      title: `Filter ${type === 'series' ? 'Series' : 'Movies'}`,
      content: FilterModalContent,
        props: {
          onApply,
          onClose: () => closeModal('filter-modal'),
          currentFilters,
          type,
        },
        size: 'xl',
        position: 'left',
        closable: true,
        backdrop: true,
      })
    }, [openModal, closeModal])

  return { openFilterModal }
}
