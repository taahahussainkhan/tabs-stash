import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksApi } from '../api/booksApi'
import type { BooksQueryParams } from '../types/book'
import type { BookCreateData } from '../types/payloads'
import { toast } from 'sonner'
import { getErrorMessage } from '../../../shared/utils/errorUtils'

export const bookKeys = {
    all: ['books'] as const,
    lists: () => [...bookKeys.all, 'list'] as const,
    list: (params: BooksQueryParams) => [...bookKeys.lists(), params] as const,
    details: () => [...bookKeys.all, 'detail'] as const,
    detail: (id: string) => [...bookKeys.details(), id] as const,
    stats: () => [...bookKeys.all, 'stats'] as const,
}

export function useBooksQuery(params: BooksQueryParams) {
    return useQuery({
        queryKey: bookKeys.list(params),
        queryFn: () => booksApi.getAll(params),
        placeholderData: (previousData) => previousData,
    })
}

export function useBookQuery(id: string) {
    return useQuery({
        queryKey: bookKeys.detail(id),
        queryFn: () => booksApi.getOne(id),
        enabled: !!id,
    })
}

export function useBooksStatsQuery() {
    return useQuery({
        queryKey: bookKeys.stats(),
        queryFn: () => booksApi.getStats(),
    })
}

export function useCreateBookMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: BookCreateData) => booksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Book created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create book: ${getErrorMessage(error)}`)
        },
    })
}

export function useUpdateBookMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BookCreateData> }) =>
            booksApi.update(id, data),
        onSuccess: (updatedBook) => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            queryClient.setQueryData(bookKeys.detail(updatedBook.public_id), updatedBook)
            toast.success('Book updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update book: ${getErrorMessage(error)}`)
        },
    })
}

export function useDeleteBookMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => booksApi.delete(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            queryClient.removeQueries({ queryKey: bookKeys.detail(id) })
            toast.success('Book deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete book: ${getErrorMessage(error)}`)
        },
    })
}

export function useStartReadingMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => booksApi.startReading(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Reading session started')
        },
        onError: () => {
            toast.error('Failed to start reading session')
        }
    })
}

export function useUpdateProgressMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, page }: { id: string; page: number }) => booksApi.updateProgress(id, page),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.all })
            toast.success('Progress updated')
        },
        onError: () => {
            toast.error('Failed to update progress')
        }
    })
}

export function useLendBookMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, lentTo }: { id: number; lentTo: string }) => booksApi.lend(id, lentTo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.all })
            toast.success('Book lent successfully')
        },
        onError: () => {
            toast.error('Failed to lend book')
        }
    })
}

export function useReturnBookMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => booksApi.returnBook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.all })
            toast.success('Book returned successfully')
        },
        onError: () => {
            toast.error('Failed to return book')
        }
    })
}
