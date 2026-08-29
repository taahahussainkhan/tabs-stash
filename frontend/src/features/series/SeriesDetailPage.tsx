import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Info, Plus, Tv } from 'lucide-react'
import { Breadcrumbs } from '../../shared/components/common/Breadcrumbs'
import { seriesService } from '../../services/seriesService'
import { useSeasonsQuery, useCreateSeasonMutation } from '../../services/seasonEpisodeService'
import { LoadingSpinner } from '../../shared/components/common/LoadingSpinner'
import { SeasonAccordion } from './components/SeasonAccordion'
import { useModal } from '../../shared/hooks/useModal'
import { ViewSeriesCommentsModalContent } from './components/modals/ViewSeriesCommentsModalContent'
import { useAddSeasonModal } from './hooks/useAddSeasonModal'
import { EmptyState } from '../../shared/components/common/EmptyState'

import type { SeasonWithProgress } from './types/seasonEpisode'

export function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>()
  const navigate = useNavigate()
  const { openModal } = useModal()
  const { openAddSeasonModal } = useAddSeasonModal()

  const { data: seriesData, isLoading: seriesLoading } = useQuery({
    queryKey: ['series', seriesId],
    queryFn: () => seriesService.getById(seriesId!),
    enabled: !!seriesId,
  })

  const { data: seasons, isLoading: seasonsLoading, error } = useSeasonsQuery(seriesId!)
  const createSeasonMutation = useCreateSeasonMutation(seriesId!)

  const isLoading = seriesLoading || seasonsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3">
        <LoadingSpinner />
        <p className="text-xs font-mono text-content-muted uppercase tracking-wider">Retrieving Series Details...</p>
      </div>
    )
  }

  if (error || !seriesData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-[#1e2026] border border-[#2e323c] p-6 rounded-[6px] max-w-md w-full">
          <p className="text-danger font-bold text-sm mb-4">Failed to load series details</p>
          <button 
            className="btn-secondary text-xs px-4 py-2 w-full" 
            onClick={() => navigate('/series')}
          >
            Return to Series Archive
          </button>
        </div>
      </div>
    )
  }

  const seasonRatings = seasons?.filter(s => s.average_rating !== null).map(s => s.average_rating!) || []
  const seriesAverageRating = seasonRatings.length > 0
    ? seasonRatings.reduce((sum: number, r: number) => sum + r, 0) / seasonRatings.length
    : null

  const totalEpisodes = seasons?.reduce((sum: number, s: SeasonWithProgress) => sum + s.total_episodes, 0) || 0
  const watchedEpisodes = seasons?.reduce((sum: number, s: SeasonWithProgress) => sum + s.watched_episodes, 0) || 0
  const overallProgress = totalEpisodes > 0 ? (watchedEpisodes / totalEpisodes) * 100 : 0

  const handleShowComments = () => {
    openModal({
      id: 'view-series-comments',
      title: 'Series Notes',
      content: ViewSeriesCommentsModalContent,
      props: {
        seriesPublicId: seriesId!,
        seriesTitle: seriesData.title,
      }
    })
  }

  const handleAddSeason = () => {
    openAddSeasonModal(
      async (data) => {
        await createSeasonMutation.mutateAsync(data)
      },
      seasons?.map(s => s.season.season_number) || []
    )
  }

  return (
    <div className="space-y-6 page-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Breadcrumbs 
          backHref="/series"
          backLabel="Back to Series Archive"
          items={[
            { label: 'Series Archive', href: '/series' },
            { label: seriesData.title }
          ]}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleShowComments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#1e2026] hover:bg-[#262830] border border-[#2e323c] text-xs font-semibold text-content-secondary hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Series Notes</span>
          </button>
          
          <button
            onClick={handleAddSeason}
            className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Season</span>
          </button>
        </div>
      </div>

      {/* Series Hero Card */}
      <div className="bg-[#1e2026] border border-[#2e323c] rounded-[6px] p-5 space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono mb-2">
            <span className="mono-badge mono-badge-ochre text-[10px]">SERIES</span>
            {seriesData.genre && (
              <span className="mono-badge mono-badge-neutral text-[10px]">{seriesData.genre}</span>
            )}
            {seriesData.year && (
              <span className="mono-badge mono-badge-neutral text-[10px]">{seriesData.year}</span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">{seriesData.title}</h1>
          {seriesData.creator && (
            <p className="text-xs font-mono text-content-muted mt-1">Creator: {seriesData.creator}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#242730] font-mono">
          <div className="bg-[#15161a] p-3 rounded-[4px] border border-[#2e323c]">
            <span className="text-[10px] uppercase text-content-muted font-bold">Total Episodes</span>
            <p className="text-lg font-bold text-content-primary mt-0.5">{totalEpisodes} <span className="text-[10px] text-content-muted font-normal">eps</span></p>
          </div>
          <div className="bg-[#15161a] p-3 rounded-[4px] border border-[#2e323c] border-l-[3px] border-l-accent-cyan">
            <span className="text-[10px] uppercase text-accent-cyan font-bold">Watched</span>
            <p className="text-lg font-bold text-content-primary mt-0.5">{watchedEpisodes} <span className="text-[10px] text-content-muted font-normal">eps</span></p>
          </div>
          <div className="bg-[#15161a] p-3 rounded-[4px] border border-[#2e323c] border-l-[3px] border-l-accent-sage">
            <span className="text-[10px] uppercase text-accent-sage font-bold">Completion</span>
            <p className="text-lg font-bold text-content-primary mt-0.5">{overallProgress.toFixed(0)}%</p>
          </div>
          <div className="bg-[#15161a] p-3 rounded-[4px] border border-[#2e323c] border-l-[3px] border-l-accent-ochre">
            <span className="text-[10px] uppercase text-accent-ochre font-bold">Score</span>
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-lg font-bold text-accent-ochre">{seriesAverageRating ? `★ ${seriesAverageRating.toFixed(1)}` : '—'}</p>
            </div>
          </div>
        </div>

        {totalEpisodes > 0 && (
          <div className="w-full h-1.5 bg-[#121316] border border-[#2e323c] rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-ochre"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Seasons Header */}
      <div className="flex items-center justify-between border-b border-[#2e323c] pb-2">
        <h2 className="text-sm font-bold text-content-primary tracking-tight">Cataloged Seasons</h2>
        {seasons && seasons.length > 0 && (
          <span className="text-[10px] font-mono text-content-muted uppercase">
            {seasons.length} Season{seasons.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Seasons List */}
      {!seasons || seasons.length === 0 ? (
        <EmptyState
          icon={Tv}
          badge="SEASON REGISTRY"
          title="No Seasons Cataloged"
          description="This series is waiting for its first season structure and episode logs."
          accent="ochre"
          actionText="Add Season 1"
          onAction={handleAddSeason}
          compact={true}
        />
      ) : (
        <div className="space-y-3">
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
  )
}
