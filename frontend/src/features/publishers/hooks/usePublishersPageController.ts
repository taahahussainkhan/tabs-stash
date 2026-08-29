
import { useState } from 'react'
import { usePublishersQuery, useCreatePublisherMutation, usePublisherNetworkQuery } from './usePublishersQuery'

export function usePublishersPageController() {
    const { data: publishers, isLoading } = usePublishersQuery()
    const { data: networkData, isLoading: isNetworkLoading } = usePublisherNetworkQuery()
    const createPublisher = useCreatePublisherMutation()
    const [newPublisherName, setNewPublisherName] = useState('')

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPublisherName.trim()) return
        createPublisher.mutate({ name: newPublisherName }, {
            onSuccess: () => setNewPublisherName('')
        })
    }

    return {
        publishers,
        networkData,
        isLoading: isLoading || isNetworkLoading,
        newPublisherName,
        setNewPublisherName,
        handleCreate,
        isCreating: createPublisher.isPending
    }
}
