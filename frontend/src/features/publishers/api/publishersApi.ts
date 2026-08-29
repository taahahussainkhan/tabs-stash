import { api } from '../../../app/api'
import type { Book } from '../../books/types/book'

export interface PublisherSearchResult {
    id: number
    name: string
    country?: string
    book_count: number
}

export interface Publisher {
    id: number
    name: string
    country?: string
    founded_year?: number
    website?: string
    description?: string
    is_predefined: boolean
    book_count: number
    created_at: string
    updated_at: string
}

export interface PublisherCreate {
    name: string
    country?: string
    founded_year?: number
    website?: string
    description?: string
}

export interface PublisherWithBooks {
    publisher: Publisher
    books: Book[]
}

export const publishersApi = {
    search: async (query: string, limit: number = 10): Promise<PublisherSearchResult[]> => {
        const response = await api.get('/publishers/search', {
            params: { q: query, limit }
        })
        return response.data
    },

    getAll: async (): Promise<Publisher[]> => {
        const response = await api.get('/publishers')
        return response.data
    },

    getNetwork: async (): Promise<PublisherWithBooks[]> => {
        const response = await api.get('/publishers/network')
        return response.data
    },

    getPublisherNetwork: async (id: number): Promise<PublisherWithBooks> => {
        const response = await api.get(`/publishers/network/${id}`)
        return response.data
    },

    create: async (data: PublisherCreate): Promise<Publisher> => {
        const response = await api.post('/publishers', data)
        return response.data
    },

    update: async (id: number, data: PublisherCreate): Promise<Publisher> => {
        const response = await api.put(`/publishers/${id}`, data)
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/publishers/${id}`)
    }
}
