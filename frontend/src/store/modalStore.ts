import { create } from 'zustand'

export type ModalInjectedProps = {
  onClose: () => void
}

export interface ModalConfig<T = Record<string, unknown>> {
  id: string
  title?: string
  content: React.ComponentType<T & ModalInjectedProps>
  props?: T
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  position?: 'center' | 'left' | 'right'
  closable?: boolean
  backdrop?: boolean
  className?: string
  footer?: React.ReactNode
}

interface ModalStore {
  modals: Map<string, ModalConfig<any>>
  openModal: <T = Record<string, unknown>>(config: ModalConfig<T>) => void
  closeModal: (id: string) => void
  closeAllModals: () => void
  isModalOpen: (id: string) => boolean
  getModal: (id: string) => ModalConfig<any> | undefined
}

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: new Map(),

  openModal: (config) => {
    set((state) => {
      const newModals = new Map(state.modals)
      newModals.set(config.id, config as ModalConfig<any>)
      return { modals: newModals }
    })
  },

  closeModal: (id) => {
    set((state) => {
      const newModals = new Map(state.modals)
      newModals.delete(id)
      return { modals: newModals }
    })
  },

  closeAllModals: () => {
    set({ modals: new Map() })
  },

  isModalOpen: (id) => {
    return get().modals.has(id)
  },

  getModal: (id) => {
    return get().modals.get(id)
  },
}))
