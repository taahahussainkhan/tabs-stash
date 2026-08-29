import { useModalStore } from '../../../store/modalStore'
import { Modal } from './Modal'

export function ModalProvider() {
  const { modals } = useModalStore()

  return (
    <>
      {Array.from(modals.values()).map(({ id, ...config }) => (
        <Modal key={id} id={id} {...config} />
      ))}
    </>
  )
}
