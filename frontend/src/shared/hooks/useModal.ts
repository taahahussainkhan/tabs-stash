import { useCallback } from 'react'
import { useModalStore, type ModalConfig } from '../../store/modalStore'

export function useModal() {
  const {
    openModal: storeOpenModal,
    closeModal: storeCloseModal,
    closeAllModals,
    isModalOpen,
    getModal,
  } = useModalStore()

  const openModal = useCallback(<T = Record<string, unknown>>(config: ModalConfig<T>) => {
    storeOpenModal(config)
  }, [storeOpenModal])

  const closeModal = useCallback((id: string) => {
    storeCloseModal(id)
  }, [storeCloseModal])

  return {
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModal,
  }
}

export function useModalToggle(id: string) {
  const { openModal, closeModal, isModalOpen } = useModal()

  const toggle = useCallback(<T = Record<string, unknown>>(config?: Omit<ModalConfig<T>, 'id'>) => {
    if (isModalOpen(id)) {
      closeModal(id)
    } else if (config) {
      openModal({ ...config, id })
    }
  }, [id, isModalOpen, closeModal, openModal])

  const open = useCallback(<T = Record<string, unknown>>(config: Omit<ModalConfig<T>, 'id'>) => {
    openModal({ ...config, id })
  }, [id, openModal])

  const close = useCallback(() => {
    closeModal(id)
  }, [id, closeModal])

  return {
    isOpen: isModalOpen(id),
    toggle,
    open,
    close,
  }
}
