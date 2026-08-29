import { useCallback } from 'react'
import { useModal } from '../../../shared/hooks/useModal'
import { SettingsModalContent } from '../components/modals/SettingsModalContent'

export function useSettingsModal() {
  const { openModal, closeModal } = useModal()

  const openSettingsModal = useCallback(() => {
    openModal({
      id: 'settings-modal',
      title: 'Display Settings',
      content: SettingsModalContent,
      props: {
        onClose: () => closeModal('settings-modal'),
      },
      size: '2xl',
      position: 'left',
      closable: true,
      backdrop: true,
    })
  }, [openModal, closeModal])

  return { openSettingsModal }
}
