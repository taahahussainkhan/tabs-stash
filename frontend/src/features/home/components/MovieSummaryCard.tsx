import type { MovieSummary } from '../types/dashboard'
import { Star, Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../../shared/utils/date'

interface MovieSummaryCardProps {
  movie: MovieSummary
}

export function MovieSummaryCard({ movie }: MovieSummaryCardProps) {
  const navigate = useNavigate()

  return (
    <div 
      className="soft-card group p-5 bg-white cursor-pointer"
      onClick={() => navigate('/movies')}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-serif text-neutral mb-1 line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          {movie.director && (
            <p className="text-sm text-gray-500 font-medium">
              {movie.director}
            </p>
          )}
        </div>
        {movie.is_favorite && (
          <div className="bg-amber-50 p-1.5 rounded-full">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full">
          {movie.status}
        </span>
        {movie.genre && (
          <span className="px-2.5 py-1 bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider rounded-full">
            {movie.genre}
          </span>
        )}
        {movie.year && (
          <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
            {movie.year}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        {movie.rating ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-bold text-neutral">{movie.rating}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-tight">Rating</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-300">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-tighter italic">No rating</span>
          </div>
        )}

        {movie.end_date && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest font-medium">
            <Calendar className="w-3 h-3 text-secondary" />
            <span>{formatDate(movie.end_date)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
