
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { publishersApi } from '../api/publishersApi'
import type { PublisherCreate } from '../api/publishersApi'

export const publisherKeys = {
    all: ['publishers'] as const,
    network: ['publishers', 'network'] as const,
}

export function usePublishersQuery() {
    return useQuery({
        queryKey: publisherKeys.all,
        queryFn: () => publishersApi.getAll()
    })
}

export function usePublisherNetworkQuery() {
    return useQuery({
        queryKey: publisherKeys.network,
        queryFn: () => publishersApi.getNetwork()
    })
}

export function useCreatePublisherMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: PublisherCreate) => publishersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: publisherKeys.all })
        }
    })
}

export function useDeletePublisherMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => publishersApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: publisherKeys.all })
        }
    })
}

export function useUpdatePublisherMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number, data: PublisherCreate }) => publishersApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: publisherKeys.all })
        }
    })
}
