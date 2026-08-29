import { useState } from 'react'
import { ChevronDown, ChevronUp, Star, CheckCircle, PlayCircle } from 'lucide-react'
import type { SeasonWithProgress } from '../types/seasonEpisode'
import { useEpisodesQuery } from '../../../services/seasonEpisodeService'
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
  const { season, watched_episodes, total_episodes, progress_percentage, average_rating } = seasonWithProgress
  const [isExpanded, setIsExpanded] = useState(false)
  const { openModal } = useModal()

  const { data: episodes, isLoading } = useEpisodesQuery(
    season.public_id,
    200,
    0
  )

  const isCompleted = total_episodes > 0 && watched_episodes === total_episodes

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
        episode,
        seasonNumber: season.season_number,
        seriesTitle,
      }
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
              {isCompleted && (
                <span className="mono-badge mono-badge-sage text-[9px]">
                  <CheckCircle className="w-3 h-3" /> Completed
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-content-muted">
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 opacity-60" />
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
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
