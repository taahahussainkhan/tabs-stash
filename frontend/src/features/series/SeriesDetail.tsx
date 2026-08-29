import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Star, MessageSquare } from 'lucide-react'
import { useSeasonsQuery } from '../../services/seasonEpisodeService'
import { seriesService } from '../../services/seriesService'
import { useQuery } from '@tanstack/react-query'
import { LoadingSpinner } from '../../shared/components/common/LoadingSpinner'
import { SeasonAccordion } from './components/SeasonAccordion'
import { ViewSeriesCommentsModal } from './components/ViewSeriesCommentsModal'

export function SeriesDetail() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const [showCommentsModal, setShowCommentsModal] = useState(false)

  // Load series info
  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => seriesService.getById(seriesId!),
    enabled: !!seriesId,
  })

  // Load seasons with progress
  const { data: seasons, isLoading: seasonsLoading, error } = useSeasonsQuery(seriesId!)

  const isLoading = seriesLoading || seasonsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !seriesData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-error mb-4">Failed to load series details</p>
          <button className="btn btn-primary" onClick={() => navigate('/series')}>
            Back to Series
          </button>
        </div>
      </div>
    )
  }

  // Calculate overall series rating from season average ratings
  const seasonRatings = seasons?.filter(s => s.average_rating !== null).map(s => s.average_rating!) || []
  const seriesAverageRating = seasonRatings.length > 0
    ? seasonRatings.reduce((sum, r) => sum + r, 0) / seasonRatings.length
    : null

  // Calculate total progress
  const totalEpisodes = seasons?.reduce((sum, s) => sum + s.total_episodes, 0) || 0
  const watchedEpisodes = seasons?.reduce((sum, s) => sum + s.watched_episodes, 0) || 0
  const overallProgress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0

  return (
    <div className="w-full min-h-screen bg-base-200/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate('/series')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{seriesData.title}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-base-content/60">
              {seriesData.creator && <span>{seriesData.creator}</span>}
              {seriesData.year && <span>{seriesData.year}</span>}
              {seriesData.genre && <span>{seriesData.genre}</span>}
            </div>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => setShowCommentsModal(true)}
          >
            <MessageSquare className="w-4 h-4" />
            View All Comments
          </button>
        </div>

        {/* Series Stats Card */}
        <div className="card bg-base-100 shadow-sm mb-6">
          <div className="card-body p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-base-content/60">Total Episodes</div>
                <div className="text-2xl font-bold">{totalEpisodes}</div>
              </div>
              <div>
                <div className="text-sm text-base-content/60">Watched</div>
                <div className="text-2xl font-bold text-success">{watchedEpisodes}</div>
              </div>
              <div>
                <div className="text-sm text-base-content/60">Progress</div>
                <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
              </div>
              {seriesAverageRating && (
                <div>
                  <div className="text-sm text-base-content/60">Average Rating</div>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    {seriesAverageRating.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Overall Progress Bar */}
            {totalEpisodes > 0 && (
              <div className="mt-4">
                <progress
                  className="progress progress-primary w-full"
                  value={overallProgress}
                  max="100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Seasons List */}
        {!seasons || seasons.length === 0 ? (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body text-center py-12">
              <p className="text-base-content/60 mb-4">No seasons found for this series</p>
              <p className="text-sm text-base-content/50">
                This series was created without season structure. You can add seasons manually or recreate the series with the "With Season Structure" option.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {seasons.map((seasonWithProgress) => (
              <SeasonAccordion
                key={seasonWithProgress.season.public_id}
                seasonWithProgress={seasonWithProgress}
                seriesPublicId={seriesId!}
                seriesTitle={seriesData.title}
              />
            ))}
          </div>
        )}
      </div>

      {/* View Comments Modal */}
      {showCommentsModal && (
        <ViewSeriesCommentsModal
          seriesPublicId={seriesId!}
          seriesTitle={seriesData.title}
          onClose={() => setShowCommentsModal(false)}
        />
      )}
    </div>
  )
}
