import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { PasswordChangeModalContent } from '../components/modals/PasswordChangeModalContent'

export function usePasswordChangeModal() {
  const { openModal, closeModal } = useModal()

  const openPasswordChangeModal = useCallback(() => {
    openModal({
      id: 'password-change-modal',
      content: PasswordChangeModalContent,
      props: {
        onClose: () => closeModal('password-change-modal'),
      },
      size: 'xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openPasswordChangeModal }
}
