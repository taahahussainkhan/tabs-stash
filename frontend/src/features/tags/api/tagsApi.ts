import { api } from '../../../app/api'

export interface Tag {
    public_id: string
    name: string
    color: string
    created_at: string
    updated_at: string
}

export interface TagCreate {
    name: string
    color: string
}

export interface TagUpdate {
    name?: string
    color?: string
}

export const tagsApi = {
    getAll: async (): Promise<Tag[]> => {
        const response = await api.get('/tags')
        return response.data
    },

    search: async (query: string): Promise<Tag[]> => {
        const response = await api.get('/tags/search', {
            params: { q: query }
        })
        return response.data
    },

    create: async (data: TagCreate): Promise<Tag> => {
        const response = await api.post('/tags', data)
        return response.data
    },

    update: async (public_id: string, data: TagUpdate): Promise<Tag> => {
        const response = await api.put(`/tags/${public_id}`, data)
        return response.data
    },

    delete: async (public_id: string): Promise<void> => {
        await api.delete(`/tags/${public_id}`)
    }
}
