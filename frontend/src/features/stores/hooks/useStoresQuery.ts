import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { storesApi } from '../api/storesApi'
import type { StoreCreate } from '../types/store'

export const storeKeys = {
    all: ['stores'] as const,
}

export function useStoresQuery() {
    return useQuery({
        queryKey: storeKeys.all,
        queryFn: () => storesApi.getAll()
    })
}

export function useCreateStoreMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: StoreCreate) => storesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all })
        }
    })
}

export function useUpdateStoreMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: StoreCreate }) => storesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all })
        }
    })
}

export function useDeleteStoreMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => storesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: storeKeys.all })
        }
    })
}
