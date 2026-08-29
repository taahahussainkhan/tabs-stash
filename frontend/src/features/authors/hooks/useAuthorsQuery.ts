import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authorsApi } from '../api/authorsApi'
import type { AuthorCreate } from '../types/author'

export const authorKeys = {
    all: ['authors'] as const,
    network: ['authors', 'network'] as const,
    singleNetwork: (id: number) => ['authors', 'network', id] as const,
}

export function useAuthorsQuery() {
    return useQuery({
        queryKey: authorKeys.all,
        queryFn: () => authorsApi.getAll()
    })
}

export function useAuthorNetworkQuery() {
    return useQuery({
        queryKey: authorKeys.network,
        queryFn: () => authorsApi.getNetwork()
    })
}

export function useSingleAuthorNetworkQuery(id: number) {
    return useQuery({
        queryKey: authorKeys.singleNetwork(id),
        queryFn: () => authorsApi.getAuthorNetwork(id),
        enabled: !!id
    })
}

export function useCreateAuthorMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: AuthorCreate) => authorsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authorKeys.all })
            queryClient.invalidateQueries({ queryKey: authorKeys.network })
        }
    })
}

export function useUpdateAuthorMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: AuthorCreate }) => authorsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authorKeys.all })
            queryClient.invalidateQueries({ queryKey: authorKeys.network })
        }
    })
}

export function useDeleteAuthorMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => authorsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authorKeys.all })
            queryClient.invalidateQueries({ queryKey: authorKeys.network })
        }
    })
}
