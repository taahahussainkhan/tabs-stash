import { useState } from 'react'
import { Check, X, Star, MessageSquare, Edit, Trash2, CheckSquare, Square } from 'lucide-react'
import {
  useEpisodesQuery,
  useMarkEpisodeWatchedMutation,
  useBulkMarkEpisodesWatchedMutation,
  useDeleteEpisodeMutation,
} from '../../../services/seasonEpisodeService'
import { LoadingSpinner } from '../../../shared/components/common/LoadingSpinner'
import { useConfirmation } from '../../../shared/hooks/useConfirmation'

interface EpisodeListProps {
  seasonPublicId: string
  seriesPublicId: string
}

export function EpisodeList({ seasonPublicId, seriesPublicId }: EpisodeListProps) {
  const { data: episodes, isLoading } = useEpisodesQuery(seasonPublicId, 200)
  const markWatchedMutation = useMarkEpisodeWatchedMutation(seasonPublicId, seriesPublicId)
  const bulkMarkWatchedMutation = useBulkMarkEpisodesWatchedMutation(seasonPublicId, seriesPublicId)
  const deleteEpisodeMutation = useDeleteEpisodeMutation(seasonPublicId, seriesPublicId)
  const { confirm } = useConfirmation()
  
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)

  const handleToggleWatched = async (episodePublicId: string, currentStatus: boolean) => {
    await markWatchedMutation.mutateAsync({
      episodePublicId,
      isWatched: !currentStatus,
    })
  }

  const handleDeleteEpisode = async (episodePublicId: string) => {
    confirm({
      title: 'Delete Episode',
      message: 'Are you sure you want to delete this episode? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deleteEpisodeMutation.mutateAsync(episodePublicId)
      },
    })
  }

  const handleToggleSelect = (episodePublicId: string) => {
    const newSelected = new Set(selectedEpisodes)
    if (newSelected.has(episodePublicId)) {
      newSelected.delete(episodePublicId)
    } else {
      newSelected.add(episodePublicId)
    }
    setSelectedEpisodes(newSelected)
  }

  const handleSelectAll = () => {
    if (episodes) {
      setSelectedEpisodes(new Set(episodes.map(e => e.public_id)))
    }
  }

  const handleDeselectAll = () => {
    setSelectedEpisodes(new Set())
  }

  const handleBulkMarkWatched = async (isWatched: boolean) => {
    await bulkMarkWatchedMutation.mutateAsync({
      episodePublicIds: Array.from(selectedEpisodes),
      isWatched,
    })
    setSelectedEpisodes(new Set())
    setBulkMode(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        <p>No episodes added yet</p>
      </div>
    )
  }

  return (
    <div>
      {/* Bulk Actions Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm ${bulkMode ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setBulkMode(!bulkMode)
              setSelectedEpisodes(new Set())
            }}
          >
            {bulkMode ? 'Cancel Bulk Mode' : 'Bulk Select'}
          </button>
          
          {bulkMode && (
            <>
              <button className="btn btn-sm btn-ghost" onClick={handleSelectAll}>
                Select All
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleDeselectAll}>
                Deselect All
              </button>
            </>
          )}
        </div>

        {bulkMode && selectedEpisodes.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-base-content/60">
              {selectedEpisodes.size} selected
            </span>
            <button
              className="btn btn-sm btn-success gap-1"
              onClick={() => handleBulkMarkWatched(true)}
            >
              <Check className="w-4 h-4" />
              Mark Watched
            </button>
            <button
              className="btn btn-sm btn-ghost gap-1"
              onClick={() => handleBulkMarkWatched(false)}
            >
              <X className="w-4 h-4" />
              Mark Unwatched
            </button>
          </div>
        )}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {episodes.map((episode) => (
          <div
            key={episode.public_id}
            className={`card bg-base-200 shadow-sm hover:shadow-md transition-shadow ${
              episode.is_watched ? 'opacity-60' : ''
            } ${
              selectedEpisodes.has(episode.public_id) ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="card-body p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  {bulkMode && (
                    <button
                      className="btn btn-ghost btn-xs btn-circle mt-1"
                      onClick={() => handleToggleSelect(episode.public_id)}
                    >
                      {selectedEpisodes.has(episode.public_id) ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        Episode {episode.episode_number}
                      </span>
                      {episode.is_watched && (
                        <Check className="w-4 h-4 text-success shrink-0" />
                      )}
                    </div>
                    
                    {episode.title && (
                      <p className="text-xs text-base-content/70 truncate mt-1">
                        {episode.title}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-base-content/60">
                      {episode.duration && <span>{episode.duration} min</span>}
                      {episode.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {episode.rating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {!bulkMode && (
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                      •••
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <button onClick={() => handleToggleWatched(episode.public_id, episode.is_watched)}>
                          {episode.is_watched ? (
                            <>
                              <X className="w-4 h-4" />
                              Mark Unwatched
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              Mark Watched
                            </>
                          )}
                        </button>
                      </li>
                      <li>
                        <button>
                          <MessageSquare className="w-4 h-4" />
                          Add Comment
                        </button>
                      </li>
                      <li>
                        <button>
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className="text-error"
                          onClick={() => handleDeleteEpisode(episode.public_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {episode.notes && (
                <p className="text-xs text-base-content/60 mt-2 line-clamp-2">
                  {episode.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
