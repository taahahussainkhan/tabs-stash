import { api } from '../../../app/api'
import type { Genre, GenreCreate } from '../types/genre'
import type { Book } from '../../books/types/book'

export interface GenreWithBooks {
    genre: Genre
    books: Book[]
}

export const genresApi = {
    getAll: async () => {
        const { data } = await api.get<Genre[]>('/genres')
        return data
    },
    getNetwork: async (): Promise<GenreWithBooks[]> => {
        const { data } = await api.get('/genres/network')
        return data
    },
    getGenreNetwork: async (id: number): Promise<GenreWithBooks> => {
        const { data } = await api.get(`/genres/network/${id}`)
        return data
    },
    create: async (data: GenreCreate) => {
        const { data: response } = await api.post<Genre>('/genres', data)
        return response
    }
}
