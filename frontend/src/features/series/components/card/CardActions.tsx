import { Eye, Edit, CheckCircle2, Play, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SeriesLog } from '../../types/series'

interface CardActionsProps {
  series: SeriesLog
  onEdit?: (series: SeriesLog) => void
  onMarkCompleted?: (series: SeriesLog) => void
  onRewatch?: (series: SeriesLog) => void
  onViewHistory?: (series: SeriesLog) => void
}

export function CardActions({ series, onEdit, onMarkCompleted, onRewatch, onViewHistory }: CardActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="mt-auto flex items-center gap-1.5 pt-3 border-t border-[#242730]">
      <button 
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/series/${series.id}`)
        }} 
        className="flex-1 h-7 rounded-[4px] bg-[#121316] hover:bg-[#262830] border border-[#2e323c] text-content-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
      >
        <Eye className="w-3 h-3" /> Seasons
      </button>
      {onEdit && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onEdit(series)
          }} 
          className="w-7 h-7 rounded-[4px] bg-[#121316] hover:bg-[#262830] border border-[#2e323c] text-content-secondary hover:text-white transition-colors flex items-center justify-center"
          title="Edit"
        >
          <Edit className="w-3 h-3" />
        </button>
      )}
      {series.status !== 'completed' && onMarkCompleted && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onMarkCompleted(series)
          }} 
          className="w-7 h-7 rounded-[4px] bg-[#143324] text-[#4ade80] hover:bg-[#1e593a] border border-[#1e593a] transition-colors flex items-center justify-center"
          title="Complete"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
        </button>
      )}
      {(series.status === 'completed' || series.status === 'paused') && onRewatch && (
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onRewatch(series)
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
            onViewHistory(series)
          }} 
          className="w-7 h-7 rounded-[4px] bg-[#121316] hover:bg-[#262830] border border-[#2e323c] text-content-muted hover:text-white transition-colors flex items-center justify-center"
          title="History"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
