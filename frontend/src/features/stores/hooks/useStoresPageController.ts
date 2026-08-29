import { useCallback } from 'react'
import { useStoresQuery, useCreateStoreMutation, useUpdateStoreMutation, useDeleteStoreMutation } from './useStoresQuery'
import type { Store, StoreCreate } from '../types/store'
import { useModal } from '../../../shared/hooks/useModal'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'
import { AddStoreModalContent } from '../components/AddStoreModalContent'
import type { StoreSchemaData } from '../schemas/storeSchema'

export function useStoresPageController() {
    const { data: stores, isLoading } = useStoresQuery()
    const createStore = useCreateStoreMutation()
    const updateStore = useUpdateStoreMutation()
    const deleteStore = useDeleteStoreMutation()


  const { openModal } = useModal()
  const { confirm } = useConfirmation()

    const handleAddStore = useCallback(() => {
      const modalId = 'add-store-modal'
      openModal({
        id: modalId,
        title: 'Add Store',
        content: AddStoreModalContent,
        props: {
          modalId,
          onSubmit: async (data: StoreSchemaData) => {
            await createStore.mutateAsync(data as StoreCreate)
          },
          title: 'Add New Store'
        },
        size: 'xl',
        position: 'left',
      })
    }, [createStore, openModal])

    const handleEditStore = useCallback((store: StoreType) => {
      const modalId = 'edit-store-modal'
      const initialData: StoreSchemaData = {
        name: store.name,
        type: store.type,
      }

      openModal({
        id: modalId,
        title: 'Edit Store',
        content: AddStoreModalContent,
        props: {
          modalId,
          onSubmit: async (data: StoreSchemaData) => {
            await updateStore.mutateAsync({ id: store.id, data: data as StoreCreate })
          },
          initialData,
          title: 'Edit Store'
        },
        size: 'xl',
        position: 'left',
      })
    }, [openModal, updateStore])

  const handleDeleteStore = useCallback(async (store: StoreType) => {
    await confirm({
      title: 'Delete Store',
      message: `Are you sure you want to delete "${store.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await deleteStore.mutateAsync(store.id)
      }
    })
  }, [confirm, deleteStore])

  return {
    stores,
    isLoading,
    handleAddStore,
    handleEditStore,
    handleDeleteStore,
  }
}

export type StoresPageController = ReturnType<typeof useStoresPageController>
