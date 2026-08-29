import { api } from '../app/api'
import type { PaginatedResponse } from '../shared/types/pagination'

export interface BaseServiceConfig<T, TBackend = any> {
  endpoint: string
  queryKey: string
  mapper?: (item: TBackend) => T
}

export class BaseService<T, TCreate = any, TUpdate = any, TBackend = any> {
  protected endpoint: string
  public queryKey: string
  protected mapper?: (item: TBackend) => T

  constructor(config: BaseServiceConfig<T, TBackend>) {
    this.endpoint = config.endpoint
    this.queryKey = config.queryKey
    this.mapper = config.mapper
  }

  async getAll(params?: any): Promise<PaginatedResponse<T>> {
    const response = await api.get<PaginatedResponse<TBackend>>(this.endpoint, { params })
    const { items, ...rest } = response.data
    return {
      ...rest,
      items: this.mapper ? items.map(this.mapper) : (items as unknown as T[]),
    }
  }

  async getById(id: string): Promise<T> {
    const response = await api.get<T>(`${this.endpoint}/${id}`)
    return response.data
  }

  async create(data: TCreate): Promise<T> {
    const response = await api.post<T>(this.endpoint, data)
    return response.data
  }

  async update(id: string, data: TUpdate): Promise<T> {
    const response = await api.put<T>(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async patch(id: string, data: Partial<TUpdate>): Promise<T> {
    const response = await api.patch<T>(`${this.endpoint}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`)
  }
}
