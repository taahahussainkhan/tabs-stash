import { api } from '../../../app/api'
import type { Store, StoreCreate } from '../types/store'

export const storesApi = {
    getAll: async () => {
        const { data } = await api.get<Store[]>('/stores')
        return data
    },
    create: async (data: StoreCreate) => {
        const { data: response } = await api.post<Store>('/stores', data)
        return response
    },
    update: async (id: number, data: StoreCreate) => {
        const { data: response } = await api.put<Store>(`/stores/${id}`, data)
        return response
    },
    delete: async (id: number) => {
        await api.delete(`/stores/${id}`)
    }
}
