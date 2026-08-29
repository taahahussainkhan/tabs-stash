import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { booksApi, type BooksQueryParams } from './api/booksApi'
import type { BookCreateData } from './types/payloads'
import { toast } from 'sonner'

export const bookKeys = {
    all: ['books'] as const,
    lists: () => [...bookKeys.all, 'list'] as const,
    stats: () => [...bookKeys.all, 'stats'] as const,
}

export function useBooks() {
    const queryClient = useQueryClient()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [filters, setFilters] = useState<Partial<BooksQueryParams>>({})

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setPage(1) // Reset to first page on search
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    // Build query params
    const queryParams: BooksQueryParams = {
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...filters,
    }

    // Fetch books
    const { data, isLoading, error } = useQuery({
        queryKey: [...bookKeys.lists(), queryParams],
        queryFn: () => booksApi.getAll(queryParams),
        placeholderData: (previousData) => previousData,
    })

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: bookKeys.stats(),
        queryFn: () => booksApi.getStats(),
    })

    // Create book mutation
    const createMutation = useMutation({
        mutationFn: (data: BookCreateData) => booksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Book added successfully')
        },
        onError: () => {
            toast.error('Failed to add book')
        },
    })

    // Update book mutation
    const updateMutation = useMutation({
        mutationFn: ({ publicId, data }: { publicId: string; data: Partial<BookCreateData> }) =>
            booksApi.update(publicId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Book updated successfully')
        },
        onError: () => {
            toast.error('Failed to update book')
        },
    })

    // Delete book mutation
    const deleteMutation = useMutation({
        mutationFn: (publicId: string) => booksApi.delete(publicId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Book deleted successfully')
        },
        onError: () => {
            toast.error('Failed to delete book')
        },
    })

    // Action handlers
    const createBook = useCallback(
        async (data: BookCreateData) => {
            await createMutation.mutateAsync(data)
        },
        [createMutation]
    )

    const updateBook = useCallback(
        async (publicId: string, data: Partial<BookCreateData>) => {
            await updateMutation.mutateAsync({ publicId, data })
        },
        [updateMutation]
    )

    const deleteBook = useCallback(
        async (publicId: string) => {
            await deleteMutation.mutateAsync(publicId)
        },
        [deleteMutation]
    )

    return {
        books: data?.items || [],
        loading: isLoading,
        error: error ? 'Failed to load books' : null,
        page,
        totalPages: data?.total_pages || 1,
        hasNext: data?.has_next || false,
        hasPrev: data?.has_prev || false,
        search,
        sortBy,
        sortOrder,
        stats,
        setPage,
        setSearch,
        setSortBy,
        setSortOrder,
        setFilters,
        createBook,
        updateBook,
        deleteBook,
    }
}

export function useCreateBook() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: BookCreateData) => booksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
            queryClient.invalidateQueries({ queryKey: bookKeys.stats() })
            toast.success('Book created successfully')
        },
        onError: () => {
            toast.error('Failed to create book')
        },
    })
}

export function useStartReading() {
    return useMutation({
        mutationFn: (itemId: number) => booksApi.startReading(itemId),
        onSuccess: () => toast.success('Reading session started'),
    })
}
