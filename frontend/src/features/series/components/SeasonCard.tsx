import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2, CheckCircle2, Star, Calendar, MessageSquare } from 'lucide-react'
import type { SeasonWithProgress } from '../types/seasonEpisode'
import { EpisodeList } from './EpisodeList'
import { useAddEpisodeModal } from '../hooks/useAddEpisodeModal'
import { useBulkAddEpisodesModal } from '../hooks/useBulkAddEpisodesModal'

interface SeasonCardProps {
  seasonWithProgress: SeasonWithProgress
  seriesPublicId: string
  onDelete: (seasonPublicId: string) => void
}

export function SeasonCard({ seasonWithProgress, seriesPublicId, onDelete }: SeasonCardProps) {
  const { season, watched_episodes, total_episodes, progress_percentage, average_rating } = seasonWithProgress
  const [isExpanded, setIsExpanded] = useState(false)
  const { openAddEpisodeModal } = useAddEpisodeModal()
  const { openBulkAddEpisodesModal } = useBulkAddEpisodesModal()

  const isCompleted = total_episodes > 0 && watched_episodes === total_episodes

  return (
    <div className={`bg-[var(--surface)] rounded-[var(--radius-md)] border border-[var(--border-color)] transition-colors ${isExpanded ? 'border-l-[3px] border-l-accent-ochre' : ''}`}>
      <div className="p-4">
        {/* Season Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button
              className="mt-0.5 p-1.5 rounded-[var(--radius-sm)] bg-[var(--background)] hover:bg-[var(--surface-light)] border border-[var(--border-color)] text-content-muted hover:text-white transition-colors"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-bold text-base text-content-primary">
                  Season {season.season_number}
                  {season.title && <span className="text-content-muted font-normal text-sm ml-1.5">/ {season.title}</span>}
                </h3>
                {isCompleted && (
                  <span className="mono-badge mono-badge-sage text-[9px]">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-content-muted">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3 opacity-60" />
                  {watched_episodes} / {total_episodes} eps
                </span>
                {season.year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 opacity-60" />
                    {season.year}
                  </span>
                )}
                {average_rating && (
                  <span className="flex items-center gap-1 text-accent-ochre font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    ★ {average_rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              {total_episodes > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-[var(--background)] border border-[var(--border-color)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-ochre transition-all duration-300"
                      style={{ width: `${progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-accent-ochre min-w-[2.5rem]">
                    {progress_percentage.toFixed(0)}%
                  </span>
                </div>
              )}

              {season.notes && (
                <p className="text-xs text-content-secondary italic mt-2.5 pl-2.5 border-l-2 border-[var(--border-color)]">{season.notes}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--background)] hover:bg-[var(--surface-light)] border border-[var(--border-color)] text-content-primary transition-colors flex items-center justify-center cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
              </label>
              <ul tabIndex={0} className="dropdown-content z-20 menu p-1 bg-[var(--surface)] border border-[var(--border-color)] rounded-[var(--radius-md)] shadow-2xl w-44 mt-1">
                <li>
                  <button onClick={() => openAddEpisodeModal(season.public_id, seriesPublicId)} className="text-xs py-1.5">
                    Add Single Episode
                  </button>
                </li>
                <li>
                  <button onClick={() => openBulkAddEpisodesModal(season.public_id, seriesPublicId)} className="text-xs py-1.5">
                    Bulk Add Episodes
                  </button>
                </li>
              </ul>
            </div>
            
            <button
              className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--danger-soft)] hover:bg-[var(--danger-soft)] border border-danger/30 text-danger transition-colors flex items-center justify-center"
              onClick={() => onDelete(season.public_id)}
              title="Delete Season"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Episodes List (Expanded) */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] animate-in fade-in duration-200">
            <EpisodeList
              seasonPublicId={season.public_id}
              seriesPublicId={seriesPublicId}
            />
          </div>
        )}
      </div>
    </div>
  )
}
