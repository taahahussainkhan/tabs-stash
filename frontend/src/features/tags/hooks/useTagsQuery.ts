import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi, type TagCreate, type TagUpdate } from '../api/tagsApi'

export const tagKeys = {
    all: ['tags'] as const,
    search: (query: string) => ['tags', 'search', query] as const,
}

export function useTagsQuery() {
    return useQuery({
        queryKey: tagKeys.all,
        queryFn: () => tagsApi.getAll()
    })
}

export function useSearchTagsQuery(query: string) {
    return useQuery({
        queryKey: tagKeys.search(query),
        queryFn: () => tagsApi.search(query),
        enabled: query.length > 0
    })
}

export function useCreateTagMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: TagCreate) => tagsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.all })
        }
    })
}

export function useUpdateTagMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ public_id, data }: { public_id: string; data: TagUpdate }) => tagsApi.update(public_id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.all })
        }
    })
}

export function useDeleteTagMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (public_id: string) => tagsApi.delete(public_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tagKeys.all })
        }
    })
}
