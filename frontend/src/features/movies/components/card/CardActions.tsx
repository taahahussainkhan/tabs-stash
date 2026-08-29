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
    <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-[#242730]">
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onEdit(movie)
          }} 
          className="flex-1 h-7 rounded-[4px] bg-[#121316] hover:bg-[#262830] border border-[#2e323c] text-content-secondary hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
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
          className="w-7 h-7 rounded-[4px] bg-[#143324] text-[#4ade80] hover:bg-[#1e593a] border border-[#1e593a] transition-colors flex items-center justify-center"
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
          className="w-7 h-7 rounded-[4px] bg-[#3b1c18] text-[#ff7b68] hover:bg-[#4f2420] border border-[#991b1b] transition-colors flex items-center justify-center"
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
          className="w-7 h-7 rounded-[4px] bg-[#121316] hover:bg-[#262830] border border-[#2e323c] text-content-muted hover:text-white transition-colors flex items-center justify-center"
          title="History"
        >
          <History className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
