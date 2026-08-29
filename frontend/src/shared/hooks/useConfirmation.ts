import { useCallback } from 'react'
import { useModalStore } from '../../store/modalStore'
import { ConfirmationModal, type ConfirmationModalProps } from '../components/common/ConfirmationModal'

type ConfirmOptions = Omit<ConfirmationModalProps, 'onClose' | 'onConfirm'> & {
  onConfirm: () => void | Promise<void>
}

export function useConfirmation() {
  const { openModal, closeModal } = useModalStore()

  const confirm = useCallback(
    (options: ConfirmOptions) => {
      const modalId = `confirmation-${Date.now()}`

      openModal({
        id: modalId,
        content: ConfirmationModal,
        props: {
          ...options,
          onClose: () => closeModal(modalId),
          onConfirm: options.onConfirm,
        },
        size: 'sm',
        closable: true,
        backdrop: true,
      })
    },
    [openModal, closeModal]
  )

  return { confirm }
}
