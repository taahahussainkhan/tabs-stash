import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { api } from '../../app/api'
import { toast } from 'sonner'

interface CrudConfig<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  resource: string
  queryKey: string
  onSuccessMessage?: string
  onErrorMessage?: string
}

export function useCrud<T, TCreate = Partial<T>, TUpdate = Partial<T>>({
  resource,
  queryKey,
  onSuccessMessage,
  onErrorMessage,
}: CrudConfig<T, TCreate, TUpdate>) {
  const queryClient = useQueryClient()

  // List
  const useList = (options?: Partial<UseQueryOptions<T[]>>) =>
    useQuery({
      queryKey: [queryKey],
      queryFn: async () => {
        const { data } = await api.get<T[]>(`/${resource}`)
        return data
      },
      ...options,
    })

  // Detail
  const useDetail = (id: number | string, options?: Partial<UseQueryOptions<T>>) =>
    useQuery({
      queryKey: [queryKey, id],
      queryFn: async () => {
        const { data } = await api.get<T>(`/${resource}/${id}`)
        return data
      },
      enabled: !!id,
      ...options,
    })

  // Create
  const useCreate = (options?: UseMutationOptions<T, Error, TCreate>) =>
    useMutation({
      mutationFn: async (data: TCreate) => {
        const { data: response } = await api.post<T>(`/${resource}`, data)
        return response
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        if (onSuccessMessage) toast.success(onSuccessMessage)
        options?.onSuccess?.(data, variables, context)
      },
      onError: (error: any, variables, context) => {
        toast.error(error.response?.data?.detail || onErrorMessage || 'Failed to create')
        options?.onError?.(error, variables, context)
      },
      ...options,
    })

  // Update
  const useUpdate = (options?: UseMutationOptions<T, Error, { id: number | string; data: TUpdate }>) =>
    useMutation({
      mutationFn: async ({ id, data }) => {
        const { data: response } = await api.put<T>(`/${resource}/${id}`, data)
        return response
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        queryClient.invalidateQueries({ queryKey: [queryKey, variables.id] })
        if (onSuccessMessage) toast.success('Updated successfully')
        options?.onSuccess?.(data, variables, context)
      },
      onError: (error: any, variables, context) => {
        toast.error(error.response?.data?.detail || onErrorMessage || 'Failed to update')
        options?.onError?.(error, variables, context)
      },
      ...options,
    })

  // Delete
  const useDelete = (options?: UseMutationOptions<void, Error, number | string>) =>
    useMutation({
      mutationFn: async (id) => {
        await api.delete(`/${resource}/${id}`)
      },
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
        toast.success('Deleted successfully')
        options?.onSuccess?.(data, variables, context)
      },
      onError: (error: any, variables, context) => {
        toast.error(error.response?.data?.detail || 'Failed to delete')
        options?.onError?.(error, variables, context)
      },
      ...options,
    })

  return {
    useList,
    useDetail,
    useCreate,
    useUpdate,
    useDelete,
  }
}
