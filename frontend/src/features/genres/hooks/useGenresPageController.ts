import { useState } from 'react'
import { useGenresQuery, useCreateGenreMutation } from './useGenresQuery'

export function useGenresPageController() {
    const { data: genres, isLoading } = useGenresQuery()
    const { data: networkData, isLoading: isNetworkLoading } = useGenreNetworkQuery()
    const createGenre = useCreateGenreMutation()
    const [newGenreName, setNewGenreName] = useState('')

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newGenreName.trim()) return
        createGenre.mutate({ name: newGenreName }, {
            onSuccess: () => setNewGenreName('')
        })
    }

    return {
        genres,
        networkData,
        isLoading: isLoading || isNetworkLoading,
        newGenreName,
        setNewGenreName,
        handleCreate,
        isCreating: createGenre.isPending
    }
}

export type GenresPageController = ReturnType<typeof useGenresPageController>
