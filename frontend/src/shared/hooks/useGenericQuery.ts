import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { BaseService } from '../../services/baseService'
import type { PaginatedResponse } from '../types/pagination'

export function useGenericQuery<T>(
  service: BaseService<T>,
  params?: any,
  options?: Omit<UseQueryOptions<PaginatedResponse<T>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [service.queryKey, 'list', params],
    queryFn: () => service.getAll(params),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

export function useGenericDetailQuery<T>(
  service: BaseService<T>,
  id: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [service.queryKey, 'detail', id],
    queryFn: () => service.getById(id),
    enabled: !!id,
    ...options,
  })
}
