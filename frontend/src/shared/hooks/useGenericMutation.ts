import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { BaseService } from '../../services/baseService'

interface MutationOptions<T, TData> extends Omit<UseMutationOptions<T, Error, TData>, 'mutationFn'> {
  successMessage?: string
  errorMessage?: string
  invalidateLists?: boolean
}

export function useGenericCreateMutation<T, TCreate>(
  service: BaseService<T, TCreate>,
  options?: MutationOptions<T, TCreate>
) {
  const queryClient = useQueryClient()
  const { successMessage = 'Created successfully', errorMessage = 'Failed to create', invalidateLists = true, ...mutationOptions } = options || {}

  return useMutation({
    mutationFn: (data: TCreate) => service.create(data),
    onSuccess: (data, variables, context) => {
      if (invalidateLists) {
        queryClient.invalidateQueries({ queryKey: [service.queryKey, 'list'] })
      }
      toast.success(successMessage)
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(errorMessage)
      options?.onError?.(error, variables, context)
    },
    ...mutationOptions,
  })
}

export function useGenericUpdateMutation<T, TUpdate>(
  service: BaseService<T, any, TUpdate>,
  options?: MutationOptions<T, { id: string; data: TUpdate }>
) {
  const queryClient = useQueryClient()
  const { successMessage = 'Updated successfully', errorMessage = 'Failed to update', invalidateLists = true, ...mutationOptions } = options || {}

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TUpdate }) => service.update(id, data),
    onSuccess: (data, variables, context) => {
      if (invalidateLists) {
        queryClient.invalidateQueries({ queryKey: [service.queryKey, 'list'] })
      }
      queryClient.invalidateQueries({ queryKey: [service.queryKey, 'detail', variables.id] })
      toast.success(successMessage)
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(errorMessage)
      options?.onError?.(error, variables, context)
    },
    ...mutationOptions,
  })
}

export function useGenericDeleteMutation<T>(
  service: BaseService<T>,
  options?: MutationOptions<void, string>
) {
  const queryClient = useQueryClient()
  const { successMessage = 'Deleted successfully', errorMessage = 'Failed to delete', invalidateLists = true, ...mutationOptions } = options || {}

  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (data, variables, context) => {
      if (invalidateLists) {
        queryClient.invalidateQueries({ queryKey: [service.queryKey, 'list'] })
      }
      queryClient.removeQueries({ queryKey: [service.queryKey, 'detail', variables] })
      toast.success(successMessage)
      options?.onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      toast.error(errorMessage)
      options?.onError?.(error, variables, context)
    },
    ...mutationOptions,
  })
}
