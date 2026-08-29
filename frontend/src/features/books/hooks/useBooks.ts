import { useState, useCallback, useEffect } from 'react'
import type { BooksQueryParams } from '../types/book'
import {
    useBooksQuery,
    useBooksStatsQuery,
    useCreateBookMutation,
    useUpdateBookMutation,
    useDeleteBookMutation,
} from './useBooksQuery'

export function useBooks() {
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

    // Queries
    const booksQuery = useBooksQuery(queryParams)
    const statsQuery = useBooksStatsQuery()

    // Mutations
    const createMutation = useCreateBookMutation()
    const updateMutation = useUpdateBookMutation()
    const deleteMutation = useDeleteBookMutation()

    const createBook = useCallback(
        async (data: any) => {
            await createMutation.mutateAsync(data)
        },
        [createMutation]
    )

    const updateBook = useCallback(
        async (id: string, data: any) => {
            await updateMutation.mutateAsync({ id, data })
        },
        [updateMutation]
    )

    const deleteBook = useCallback(
        async (id: string) => {
            await deleteMutation.mutateAsync(id)
        },
        [deleteMutation]
    )

    return {
        books: booksQuery.data?.items || [],
        loading: booksQuery.isLoading,
        isRefetching: booksQuery.isRefetching,
        error: booksQuery.error ? 'Failed to load books' : null,
        page,
        pageSize,
        totalPages: booksQuery.data?.total_pages || 1,
        hasNext: booksQuery.data?.has_next || false,
        hasPrev: booksQuery.data?.has_prev || false,
        search,
        sortBy,
        sortOrder,
        filters,
        stats: statsQuery.data,
        setPage,
        setSearch,
        setSortBy,
        setSortOrder,
        setFilters,
        createBook,
        updateBook,
        deleteBook,
        refetch: booksQuery.refetch,
    }
}
