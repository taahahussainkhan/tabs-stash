import { useState } from 'react'
import { ChevronDown, ChevronUp, Star, CheckCircle, PlayCircle, Clock, Check, RotateCcw, Loader2 } from 'lucide-react'
import type { SeasonWithProgress } from '../types/seasonEpisode'
import {
  useEpisodesQuery,
  useMarkEpisodeWatchedMutation,
  useMarkSeasonWatchedMutation,
} from '../../../services/seasonEpisodeService'
import { LoadingSpinner } from '../../../shared/components/common/LoadingSpinner'
import { EpisodeCard } from './EpisodeCard'
import { useModal } from '../../../shared/hooks/useModal'
import { EpisodeTrackingModalContent } from './modals/EpisodeTrackingModalContent'
import { AddEpisodeCommentsModalContent } from './modals/AddEpisodeCommentsModalContent'

interface SeasonAccordionProps {
  seasonWithProgress: SeasonWithProgress
  seriesPublicId: string
  seriesTitle: string
}

export function SeasonAccordion({ seasonWithProgress, seriesPublicId, seriesTitle }: SeasonAccordionProps) {
  const season = seasonWithProgress.season || {
    public_id: (seasonWithProgress as any).public_id || (seasonWithProgress as any).publicId || '',
    season_number: (seasonWithProgress as any).season_number || (seasonWithProgress as any).seasonNumber || 1,
    title: (seasonWithProgress as any).title || '',
    year: (seasonWithProgress as any).year,
    episode_count: (seasonWithProgress as any).episode_count || (seasonWithProgress as any).total_episodes || 0,
    created_at: '',
    updated_at: '',
    series_id: 0,
    notes: null,
  }
  const watched_episodes = seasonWithProgress.watched_episodes ?? (seasonWithProgress as any).watchedCount ?? 0
  const total_episodes = seasonWithProgress.total_episodes ?? (seasonWithProgress as any).episode_count ?? 0
  const progress_percentage = seasonWithProgress.progress_percentage ?? 0
  const average_rating = seasonWithProgress.average_rating ?? null

  const [isExpanded, setIsExpanded] = useState(false)
  const { openModal } = useModal()

  const { data: episodes, isLoading } = useEpisodesQuery(
    season.public_id,
    200,
    0
  )
  const markEpisodeWatchedMutation = useMarkEpisodeWatchedMutation(season.public_id, seriesPublicId)
  const markSeasonWatchedMutation = useMarkSeasonWatchedMutation(seriesPublicId)

  const isCompleted = total_episodes > 0 && watched_episodes === total_episodes
  const seasonStatus: 'to_watch' | 'watching' | 'completed' =
    isCompleted
      ? 'completed'
      : watched_episodes > 0
      ? 'watching'
      : 'to_watch'

  const handleToggleWatched = (episode: any, e: React.MouseEvent) => {
    e.stopPropagation()
    const nextWatched = !episode.is_watched
    markEpisodeWatchedMutation.mutate({
      episodePublicId: episode.public_id,
      isWatched: nextWatched,
    })
  }

  const handleEpisodeClick = (episode: any) => {
    openModal({
      id: `episode-tracking-${episode.public_id}`,
      title: 'Episode Tracking',
      content: EpisodeTrackingModalContent,
      props: {
        episode,
        seasonNumber: season.season_number,
        seriesTitle,
        seriesPublicId,
        seasonPublicId: season.public_id,
      }
    })
  }

  const handleAddComments = (episode: any) => {
    openModal({
      id: `add-episode-note-${episode.public_id}`,
      title: 'Episode Note',
      content: AddEpisodeCommentsModalContent,
      props: {
        episodePublicId: episode.public_id,
        episodeTitle: episode.title || `Episode ${episode.episode_number}`,
        episodeNumber: episode.episode_number,
      },
    })
  }

  return (
    <div 
      className={`overflow-hidden transition-colors rounded-[6px] border border-[#2e323c] ${
        isExpanded ? 'bg-[#1e2026] border-l-[3px] border-l-accent-ochre' : 'bg-[#1e2026] hover:bg-[#262830]'
      }`}
    >
      {/* Season Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-8 h-8 rounded-[4px] bg-[#121316] border border-[#2e323c] flex items-center justify-center text-content-muted">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-accent-ochre" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-content-primary">
                Season {season.season_number}
                {season.title && <span className="text-content-muted font-normal text-sm ml-1.5">/ {season.title}</span>}
              </h3>

              {/* Season Status Badge */}
              {seasonStatus === 'completed' ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold text-[#4ade80] bg-[#143324] border border-[#1e593a] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              ) : seasonStatus === 'watching' ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold text-[#2dd4bf] bg-[#0f2e2b] border border-[#134e4a] flex items-center gap-1">
                  <PlayCircle className="w-3 h-3" /> In Progress
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold text-[#a5b4fc] bg-[#1e1b4b] border border-[#3730a3] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> To Watch
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-content-muted">
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-[#9ca3af]" />
                {watched_episodes} / {total_episodes} episodes
              </span>
              {season.year && <span>&bull; {season.year}</span>}
              {average_rating && (
                <span className="flex items-center gap-1 text-accent-ochre font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  ★ {average_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Mark Season Button & Progress */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                markSeasonWatchedMutation.mutate({
                  seasonPublicId: season.public_id,
                  isWatched: !isCompleted,
                })
              }}
              disabled={markSeasonWatchedMutation.isPending}
              title={isCompleted ? 'Mark all episodes in season as unwatched' : 'Mark all episodes in season as completed'}
              className={`px-2.5 py-1 rounded-[4px] border text-[10px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                isCompleted
                  ? 'bg-[#1a1c23] hover:bg-[#232630] border-[#2e323c] text-[#9ca3af] hover:text-white'
                  : 'bg-[#143324] hover:bg-[#1a4430] border-[#1e593a] text-[#4ade80] hover:text-white'
              }`}
            >
              {markSeasonWatchedMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#d97706]" />
              ) : isCompleted ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Unmark Season</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3" />
                  <span>Mark Season Watched</span>
                </>
              )}
            </button>

            {/* Linear / Text Progress */}
            <div className="text-right font-mono hidden sm:block">
              <div className="text-xs font-bold text-accent-ochre">{progress_percentage.toFixed(0)}%</div>
              <div className="w-20 h-1.5 bg-[#121316] border border-[#2e323c] rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-accent-ochre" 
                  style={{ width: `${progress_percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Grid (Expanded) */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[#242730] animate-in fade-in duration-200">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : !episodes || episodes.length === 0 ? (
            <div className="text-center py-6 text-xs font-mono text-content-muted">
              No episodes cataloged for this season yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
              {episodes.map((episode) => (
                <EpisodeCard
                  key={episode.public_id}
                  episode={episode}
                  onEpisodeClick={() => handleEpisodeClick(episode)}
                  onAddComments={() => handleAddComments(episode)}
                  onToggleWatched={(e) => handleToggleWatched(episode, e)}
                  isTogglingWatched={
                    markEpisodeWatchedMutation.isPending &&
                    markEpisodeWatchedMutation.variables?.episodePublicId === episode.public_id
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
