import { api } from '../../../app/api'
import type { Book } from '../../books/types/book'

export interface AuthorSearchResult {
    id: number
    name: string
    country?: string
    book_count: number
}

export interface Author {
    id: number
    name: string
    bio?: string
    country?: string
    language?: string
    birth_year?: number
    death_year?: number
    website?: string
    image_url?: string
    is_predefined: boolean
    book_count: number
    created_at: string
    updated_at: string
}

export interface AuthorCreate {
    name: string
    bio?: string
    country?: string
    language?: string
    birth_year?: number
    death_year?: number
    website?: string
    image_url?: string
}

export interface AuthorWithBooks {
    author: Author
    books: Book[]
}

export const authorsApi = {
    search: async (query: string, limit: number = 10): Promise<AuthorSearchResult[]> => {
        const response = await api.get('/authors/search', {
            params: { q: query, limit }
        })
        return response.data
    },

    getAll: async (): Promise<Author[]> => {
        const response = await api.get('/authors')
        return response.data
    },

    getNetwork: async (): Promise<AuthorWithBooks[]> => {
        const response = await api.get('/authors/network')
        return response.data
    },

    getAuthorNetwork: async (id: number): Promise<AuthorWithBooks> => {
        const response = await api.get(`/authors/network/${id}`)
        return response.data
    },

    create: async (data: AuthorCreate): Promise<Author> => {
        const response = await api.post('/authors', data)
        return response.data
    },

    update: async (id: number, data: AuthorCreate): Promise<Author> => {
        const response = await api.put(`/authors/${id}`, data)
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/authors/${id}`)
    }
}
