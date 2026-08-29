import { api } from '../../../app/api'
import type {
    BookItem,
    BooksQueryParams,
    BooksStats,
    BookWithDetails
} from '../types/book'
import type { BookCreateData } from '../types/payloads'
import type { PaginatedResponse } from '../../../shared/types/pagination'

export const booksApi = {
    getAll: async (params: BooksQueryParams = {}): Promise<PaginatedResponse<BookItem>> => {
        const response = await api.get<PaginatedResponse<BookItem>>('/books', { params })
        return response.data
    },

    getStats: async (): Promise<BooksStats> => {
        const response = await api.get<BooksStats>('/books/stats')
        return response.data
    },

    create: async (data: BookCreateData): Promise<BookItem> => {
        const response = await api.post<BookItem>('/books', data)
        return response.data
    },

    update: async (id: string, data: Partial<BookCreateData>): Promise<BookItem> => {
        const response = await api.put<BookItem>(`/books/${id}`, data)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/books/${id}`)
    },

    getOne: async (id: string): Promise<BookWithDetails> => {
        const response = await api.get<BookWithDetails>(`/books/${id}`)
        return response.data
    },

    startReading: async (id: number): Promise<{ session_id: string; status: string }> => {
        const response = await api.post<{ session_id: string; status: string }>(`/books/${id}/reading/start`)
        return response.data
    },

    updateProgress: async (id: string, page: number): Promise<any> => {
        const response = await api.put(`/books/sessions/${id}/progress`, null, { params: { page } })
        return response.data
    },

    lend: async (id: number, lentTo: string): Promise<any> => {
        const response = await api.post(`/books/${id}/lend`, null, { params: { lent_to: lentTo } })
        return response.data
    },

    returnBook: async (id: number): Promise<any> => {
        const response = await api.post(`/books/${id}/return`)
        return response.data
    }
}
