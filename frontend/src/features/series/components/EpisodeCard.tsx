import { Star, CheckCircle2, MessageSquare, Clock, Check, RotateCcw, Circle, Loader2 } from 'lucide-react'
import type { Episode } from '../types/seasonEpisode'

interface EpisodeCardProps {
  episode: Episode
  onEpisodeClick: () => void
  onAddComments: () => void
  onToggleWatched?: (e: React.MouseEvent) => void
  isTogglingWatched?: boolean
}

export function EpisodeCard({
  episode,
  onEpisodeClick,
  onAddComments,
  onToggleWatched,
  isTogglingWatched = false,
}: EpisodeCardProps) {
  const hasComments = (episode.comment_count ?? 0) > 0
  const isWatched = Boolean(episode.is_watched)
  const isInProgress = !isWatched && (episode.current_timestamp ?? 0) > 0

  return (
    <div
      onClick={onEpisodeClick}
      className={`group bg-[#15161a] hover:bg-[#1e2026] rounded-[4px] border border-[#2e323c] hover:border-[#d97706] transition-colors cursor-pointer overflow-hidden flex flex-col justify-between ${
        isWatched
          ? 'border-l-2 border-l-[#4ade80]'
          : isInProgress
          ? 'border-l-2 border-l-[#2dd4bf]'
          : 'border-l-2 border-l-[#6366f1]'
      }`}
    >
      <div className="p-3 flex-1 flex flex-col">
        {/* Top bar: Episode Number, Status Pill & Quick Action Check */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="mono-badge mono-badge-neutral text-[9px]">
              EP {episode.episode_number}
            </span>

            {/* Status Badge with solid colors */}
            {isWatched ? (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[#4ade80] bg-[#143324] border border-[#1e593a]">
                Watched
              </span>
            ) : isInProgress ? (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[#2dd4bf] bg-[#0f2e2b] border border-[#134e4a]">
                In Progress
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[#a5b4fc] bg-[#1e1b4b] border border-[#3730a3]">
                To Watch
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {hasComments && <MessageSquare className="w-3.5 h-3.5 text-[#2dd4bf]" />}

            {/* Direct 1-click Quick Toggle Button */}
            {onToggleWatched && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleWatched(e)
                }}
                disabled={isTogglingWatched}
                title={isWatched ? 'Mark as to watch (unwatched)' : 'Quick mark as completed'}
                aria-label={isWatched ? 'Mark unwatched' : 'Mark watched'}
                className="p-1 rounded bg-[#1e2026] hover:bg-[#2e323c] border border-[#2e323c] transition-all text-[#9ca3af] hover:text-[#ffffff]"
              >
                {isTogglingWatched ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
                ) : isWatched ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80] hover:scale-110 transition-transform" />
                ) : (
                  <Circle className="w-4 h-4 text-[#6b7280] hover:text-[#4ade80] hover:scale-110 transition-transform" />
                )}
              </button>
            )}
          </div>
        </div>

        <h4 className="text-xs font-bold text-content-primary truncate group-hover:text-white transition-colors mb-2">
          {episode.title || `Episode ${episode.episode_number}`}
        </h4>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-content-muted">
          {episode.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#9ca3af]" />
              {episode.duration}m
            </span>
          )}
          {episode.rating != null && (
            <span className="flex items-center gap-0.5 text-[#fbbf24] font-bold">
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

        {/* Quick Action Footer */}
        <div className="mt-3 pt-2 border-t border-[#242730] flex items-center gap-1.5 transition-opacity">
          {onToggleWatched && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleWatched(e)
              }}
              disabled={isTogglingWatched}
              className={`flex-1 h-6 rounded-[3px] border text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                isWatched
                  ? 'bg-[#1a1c23] hover:bg-[#232630] border-[#2e323c] text-[#9ca3af] hover:text-white'
                  : 'bg-[#143324] hover:bg-[#1a4430] border-[#1e593a] text-[#4ade80] hover:text-white'
              }`}
            >
              {isTogglingWatched ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#d97706]" />
              ) : isWatched ? (
                <>
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Unmark</span>
                </>
              ) : (
                <>
                  <Check className="w-2.5 h-2.5" />
                  <span>Complete</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddComments()
            }}
            className="h-6 px-2.5 rounded-[3px] bg-[#1e2026] hover:bg-[#262830] border border-[#2e323c] text-[10px] font-mono font-bold uppercase text-content-secondary hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare className="w-2.5 h-2.5" />
            <span>Note</span>
          </button>
        </div>
      </div>
    </div>
  )
}

