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
      className={`group bg-[var(--surface-input)] hover:bg-[var(--surface)] rounded-[var(--radius-sm)] border border-[var(--border-color)] hover:border-[#d97706] transition-colors cursor-pointer overflow-hidden flex flex-col justify-between ${
        isWatched
          ? 'border-l-2 border-l-[var(--success)]'
          : isInProgress
          ? 'border-l-2 border-l-[var(--accent-sage)]'
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
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[var(--success)] bg-[var(--success-soft)] border border-[var(--success)]">
                Watched
              </span>
            ) : isInProgress ? (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[var(--accent-sage)] bg-[var(--success-soft)] border border-[var(--success)]">
                In Progress
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold text-[var(--accent-indigo)] bg-[var(--primary-soft)] border border-[var(--accent-indigo)]">
                To Watch
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {hasComments && <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-sage)]" />}

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
                className="p-1 rounded bg-[var(--surface)] hover:bg-[var(--border-color)] border border-[var(--border-color)] transition-all text-[var(--content-secondary)] hover:text-[#ffffff]"
              >
                {isTogglingWatched ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d97706]" />
                ) : isWatched ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--success)] hover:scale-110 transition-transform" />
                ) : (
                  <Circle className="w-4 h-4 text-[#6b7280] hover:text-[var(--success)] hover:scale-110 transition-transform" />
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
              <Clock className="w-3 h-3 text-[var(--content-secondary)]" />
              {episode.duration}m
            </span>
          )}
          {episode.rating != null && (
            <span className="flex items-center gap-0.5 text-[var(--warning)] font-bold">
              <Star className="w-3 h-3 fill-current" />
              ★ {episode.rating.toFixed(1)}
            </span>
          )}
        </div>

        {episode.notes && (
          <p className="text-[10px] text-content-secondary italic mt-2 line-clamp-1 pl-2 border-l border-[var(--border-color)]">
            {episode.notes}
          </p>
        )}

        {/* Quick Action Footer */}
        <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1.5 transition-opacity">
          {onToggleWatched && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleWatched(e)
              }}
              disabled={isTogglingWatched}
              className={`flex-1 h-6 rounded-[var(--radius-xs)] border text-[10px] font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                isWatched
                  ? 'bg-[#1a1c23] hover:bg-[#232630] border-[var(--border-color)] text-[var(--content-secondary)] hover:text-white'
                  : 'bg-[var(--success-soft)] hover:bg-[#1a4430] border-[var(--success)] text-[var(--success)] hover:text-white'
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
            className="h-6 px-2.5 rounded-[var(--radius-xs)] bg-[var(--surface)] hover:bg-[var(--surface-light)] border border-[var(--border-color)] text-[10px] font-mono font-bold uppercase text-content-secondary hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare className="w-2.5 h-2.5" />
            <span>Note</span>
          </button>
        </div>
      </div>
    </div>
  )
}

