import { useCallback } from 'react'
import { useAuthorsQuery, useAuthorNetworkQuery, useCreateAuthorMutation, useUpdateAuthorMutation, useDeleteAuthorMutation } from './useAuthorsQuery'
import type { Author, AuthorCreate } from '../types/author'
import { useModal } from '../../../shared/hooks/useModal'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'
import { AddAuthorModalContent } from '../components/AddAuthorModalContent'
import type { AuthorSchemaData } from '../schemas/authorSchema'

export function useAuthorsPageController() {
    const { data: authors, isLoading } = useAuthorsQuery()
    const { data: networkData, isLoading: isLoadingNetwork } = useAuthorNetworkQuery()
    const createAuthor = useCreateAuthorMutation()
    const updateAuthor = useUpdateAuthorMutation()
    const deleteAuthor = useDeleteAuthorMutation()

    const { openModal } = useModal()
    const { confirm } = useConfirmation()

    const handleAddAuthor = useCallback(() => {
        const modalId = 'add-author-modal'
        openModal({
            id: modalId,
            title: 'Add Author',
            content: AddAuthorModalContent,
            props: {
                modalId,
                onSubmit: async (data: AuthorSchemaData) => {
                    await createAuthor.mutateAsync(data as AuthorCreate)
                },
                title: 'Add New Author'
            },
            size: 'xl',
            position: 'left',
        })
    }, [openModal, createAuthor])

    const handleEditAuthor = useCallback((author: Author) => {
        const modalId = 'edit-author-modal'
        const initialData: AuthorSchemaData = {
            name: author.name,
            bio: author.bio || undefined,
            country: author.country || undefined,
            language: author.language || undefined,
            birth_year: author.birth_year || undefined,
        }

        openModal({
            id: modalId,
            title: 'Edit Author',
            content: AddAuthorModalContent,
            props: {
                modalId,
                onSubmit: async (data: AuthorSchemaData) => {
                    await updateAuthor.mutateAsync({ id: author.id, data: data as AuthorCreate })
                },
                initialData,
                title: 'Edit Author'
            },
            size: 'xl',
            position: 'left',
        })
    }, [openModal, updateAuthor])

    const handleDeleteAuthor = useCallback((author: Author) => {
        confirm({
            title: 'Delete Author',
            message: `Are you sure you want to delete "${author.name}"? ${author.book_count > 0 ? `This author has ${author.book_count} book(s) associated with them.` : ''}`,
            confirmText: 'Delete',
            variant: 'danger',
            onConfirm: async () => {
                await deleteAuthor.mutateAsync(author.id)
            },
        })
    }, [confirm, deleteAuthor])

    return {
        authors,
        networkData,
        isLoading: isLoading || isLoadingNetwork,
        handleAddAuthor,
        handleEditAuthor,
        handleDeleteAuthor
    }
}

export type AuthorsPageController = ReturnType<typeof useAuthorsPageController>
