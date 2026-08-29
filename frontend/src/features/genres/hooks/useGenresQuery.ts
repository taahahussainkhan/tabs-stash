import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { genresApi } from '../api/genresApi'
import type { GenreCreate } from '../types/genre'

export const genreKeys = {
    all: ['genres'] as const,
    network: ['genres', 'network'] as const,
}

export function useGenresQuery() {
    return useQuery({
        queryKey: genreKeys.all,
        queryFn: () => genresApi.getAll()
    })
}

export function useGenreNetworkQuery() {
    return useQuery({
        queryKey: genreKeys.network,
        queryFn: () => genresApi.getNetwork()
    })
}

export function useCreateGenreMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: GenreCreate) => genresApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: genreKeys.all })
        }
    })
}
