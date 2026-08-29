import { Star, CheckCircle2, MessageSquare, Clock } from 'lucide-react'
import type { Episode } from '../types/seasonEpisode'

interface EpisodeCardProps {
  episode: Episode
  onEpisodeClick: () => void
  onAddComments: () => void
}

export function EpisodeCard({ episode, onEpisodeClick, onAddComments }: EpisodeCardProps) {
  const hasComments = (episode.comment_count ?? 0) > 0

  return (
    <div
      onClick={onEpisodeClick}
      className={`group bg-[#15161a] hover:bg-[#1e2026] rounded-[4px] border border-[#2e323c] hover:border-accent-ochre/50 transition-colors cursor-pointer overflow-hidden ${
        episode.is_watched ? 'border-l-2 border-l-accent-sage' : ''
      }`}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="mono-badge mono-badge-neutral text-[9px]">
            EP {episode.episode_number}
          </span>
          <div className="flex items-center gap-1">
            {episode.is_watched && <CheckCircle2 className="w-3.5 h-3.5 text-accent-sage" />}
            {hasComments && <MessageSquare className="w-3.5 h-3.5 text-accent-cyan opacity-80" />}
          </div>
        </div>

        <h4 className="text-xs font-bold text-content-primary truncate group-hover:text-white transition-colors mb-2">
          {episode.title || `Episode ${episode.episode_number}`}
        </h4>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-content-muted">
          {episode.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 opacity-60" />
              {episode.duration}m
            </span>
          )}
          {episode.rating != null && (
            <span className="flex items-center gap-0.5 text-accent-ochre font-bold">
              <Star className="w-3 h-3 fill-current" />
              ★ {episode.rating.toFixed(1)}
            </span>
          )}
        </div>

        {episode.notes && (
          <p className="text-[10px] text-content-secondary italic mt-2 line-clamp-1 pl-2 border-l border-[#2e323c]">
            {episode.notes}
          </p>
        )}

        <div className="mt-2.5 pt-2 border-t border-[#242730] opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onAddComments()
            }}
            className="w-full h-6 rounded-[3px] bg-[#1e2026] hover:bg-[#262830] border border-[#2e323c] text-[10px] font-mono font-bold uppercase text-content-secondary hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-2.5 h-2.5" />
            <span>Note</span>
          </button>
        </div>
      </div>
    </div>
  )
}
