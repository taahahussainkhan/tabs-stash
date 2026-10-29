import { Edit, CheckCircle2, Play, History } from 'lucide-react'
import type { MovieLog } from '../../types/movie'

interface CardActionsProps {
  movie: MovieLog
  onEdit?: (movie: MovieLog) => void
  onMarkCompleted?: (movie: MovieLog) => void
  onRewatch?: (movie: MovieLog) => void
  onViewHistory?: (movie: MovieLog) => void
}

export function CardActions({ movie, onEdit, onMarkCompleted, onRewatch, onViewHistory }: CardActionsProps) {
  return (
    <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-[var(--border-subtle)]">
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onEdit(movie)
          }} 
          className="flex-1 h-7 rounded-[var(--radius-sm)] bg-[var(--background)] hover:bg-[var(--surface-light)] border border-[var(--border-color)] text-content-secondary hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Edit className="w-3 h-3" /> Edit
        </button>
      )}
      {onMarkCompleted && movie.status !== 'completed' && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onMarkCompleted(movie)
          }} 
          className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--success-soft)] text-[var(--success)] hover:bg-[var(--success)] border border-[var(--success)] transition-colors flex items-center justify-center"
          title="Complete"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}
      {(movie.status === 'completed' || movie.status === 'paused') && onRewatch && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onRewatch(movie)
          }} 
          className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--primary-soft)] text-[var(--primary)] hover:bg-[#4f2420] border border-[var(--danger)] transition-colors flex items-center justify-center"
          title="Rewatch"
        >
          <Play className="w-3.5 h-3.5" />
        </button>
      )}
      {onViewHistory && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onViewHistory(movie)
          }} 
          className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--background)] hover:bg-[var(--surface-light)] border border-[var(--border-color)] text-content-muted hover:text-white transition-colors flex items-center justify-center"
          title="History"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
