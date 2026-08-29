import { useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, X } from 'lucide-react'
import { useSeasonsQuery, useEpisodesQuery, useEpisodeCommentsQuery } from '../../../../services/seasonEpisodeService'
import type { EpisodeCommentData } from '../../types/seasonEpisode'
import { LoadingSpinner } from '../../../../shared/components/common/LoadingSpinner'
import { CommentItem } from '../../../../shared/components/common/CommentItem'
import { useModal } from '../../../../shared/hooks/useModal'

interface EpisodeWithComments {
  episodeNumber: number
  episodeTitle?: string
  episodePublicId: string
  comments: EpisodeCommentData[]
}

function EpisodeCommentsSection({ episode }: { episode: EpisodeWithComments }) {
  if (episode.comments.length === 0) {
    return null
  }

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="mono-badge mono-badge-cyan text-[9px]">
          EP {episode.episodeNumber}
        </span>
        <h4 className="font-bold text-xs text-content-primary">
          {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
        </h4>
      </div>
      <div className="space-y-2 pl-3 border-l-2 border-[#2e323c]">
        {episode.comments.map((comment, idx) => (
          <CommentItem
            key={comment.public_id || idx}
            comment={comment}
            showActions={false}
          />
        ))}
      </div>
    </div>
  )
}

function SeasonCommentsSection({ 
  seasonNumber, 
  seasonTitle, 
  seasonPublicId 
}: { 
  seasonNumber: number
  seasonTitle?: string
  seasonPublicId: string 
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { data: episodes, isLoading: episodesLoading } = useEpisodesQuery(seasonPublicId, 200, 0)
  
  const episodesWithCommentsData = (episodes || []).map(episode => {
    const { data: comments, isLoading: commentsLoading } = useEpisodeCommentsQuery(episode.public_id)
    return {
      episode,
      comments: comments || [],
      isLoading: commentsLoading
    }
  })

  const isLoading = episodesLoading || episodesWithCommentsData.some(e => e.isLoading)
  const episodesWithComments: EpisodeWithComments[] = episodesWithCommentsData
    .filter(e => e.comments.length > 0)
    .map(e => ({
      episodeNumber: e.episode.episode_number,
      episodeTitle: e.episode.title,
      episodePublicId: e.episode.public_id,
      comments: e.comments
    }))

  const totalComments = episodesWithComments.reduce((sum, e) => sum + e.comments.length, 0)

  if (!isLoading && totalComments === 0) {
    return null
  }

  return (
    <div className="bg-[#15161a] border border-[#2e323c] rounded-[6px] overflow-hidden mb-3">
      <button
        type="button"
        className="w-full flex items-center justify-between p-3.5 hover:bg-[#1e2026] transition-colors text-left cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-[3px] bg-[#121316] border border-[#2e323c] flex items-center justify-center text-content-muted">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-accent-ochre" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
          <div>
            <h3 className="font-bold text-xs text-content-primary">
              Season {seasonNumber}
              {seasonTitle && <span className="text-content-muted font-normal ml-1">/ {seasonTitle}</span>}
            </h3>
            <span className="text-[10px] font-mono text-content-muted">
              {totalComments} log note{totalComments !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[#242730]">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-2">
              {episodesWithComments.map(episode => (
                <EpisodeCommentsSection key={episode.episodePublicId} episode={episode} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ViewSeriesCommentsModalContentProps {
  seriesPublicId: string
  seriesTitle: string
}

export function ViewSeriesCommentsModalContent({ 
  seriesPublicId, 
  seriesTitle, 
}: ViewSeriesCommentsModalContentProps) {
  const { closeModal } = useModal()
  const { data: seasons, isLoading } = useSeasonsQuery(seriesPublicId)

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-ochre text-[9px]">SERIES LOGS</span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">{seriesTitle}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Series Notes &amp; Observations
          </h2>
          <p className="text-xs text-content-secondary">
            Collated commentary and episode timestamps across cataloged seasons.
          </p>
        </div>

        {/* List */}
        <div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-2">
              <LoadingSpinner />
              <p className="text-xs font-mono text-content-muted">Retrieving notes...</p>
            </div>
          ) : !seasons || seasons.length === 0 ? (
            <div className="text-center py-12 bg-[#15161a] border border-[#2e323c] rounded-[6px]">
              <p className="text-xs font-mono text-content-muted">No cataloged notes for this series.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {seasons.map(seasonWithProgress => (
                <SeasonCommentsSection
                  key={seasonWithProgress.season.public_id}
                  seasonNumber={seasonWithProgress.season.season_number}
                  seasonTitle={seasonWithProgress.season.title}
                  seasonPublicId={seasonWithProgress.season.public_id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-end bg-[#17181d] shrink-0">
        <button 
          type="button" 
          className="btn-secondary text-xs px-5 py-2 font-semibold" 
          onClick={() => closeModal('view-series-comments')}
        >
          Close Notes
        </button>
      </div>
    </div>
  )
}
