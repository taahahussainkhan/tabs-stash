import { memo } from 'react'
import type { MovieLog } from '../types/movie'
import { useNavigate } from 'react-router-dom'
import { 
  MessageSquare, Star, Bookmark, Calendar, User, Tag, Edit, 
  History, CheckCircle2, Trash2 
} from 'lucide-react'
import { getStatusColorClass, getStatusDotClass } from '../../../shared/utils/styles'
import { 
  CardContainer, 
  CardHeader, 
  CardStats, 
  StatItem 
} from '../../../shared/components/common/Card'
import { CardActions } from './card/CardActions'

interface MovieCardProps {
  movie: MovieLog
  onEdit?: (movie: MovieLog) => void
  onAddComments?: (movie: MovieLog) => void
  onRewatch?: (movie: MovieLog) => void
  onViewHistory?: (movie: MovieLog) => void
  onMarkCompleted?: (movie: MovieLog) => void
  onDelete?: (movie: MovieLog) => void
  onToggleFavorite?: (movie: MovieLog) => void | Promise<void>
  onToggleWatchlist?: (movie: MovieLog) => void | Promise<void>
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list' | 'compact'
}

export const MovieCard = memo(function MovieCard({
  movie,
  onEdit,
  onAddComments,
  onRewatch,
  onViewHistory,
  onMarkCompleted,
  onDelete,
  onToggleFavorite,
  onToggleWatchlist,
  layout = 'grid'
}: MovieCardProps) {
  const navigate = useNavigate()
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    void onToggleFavorite?.(movie)
  }

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    void onToggleWatchlist?.(movie)
  }

  const isList = layout === 'list'

  const dropdownItems = (
    <>
      <li>
        <button onClick={handleToggleFavorite} className={movie.is_favorite ? 'text-accent-ochre font-bold' : ''}>
          <Star className={`w-3.5 h-3.5 ${movie.is_favorite ? 'fill-current' : ''}`} />
          {movie.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
        </button>
      </li>
      {(movie.status !== 'watching' && movie.status !== 'rewatching') && (
        <li>
          <button onClick={handleToggleWatchlist} className={movie.is_watchlist ? 'text-accent-cyan font-bold' : ''}>
            <Bookmark className={`w-3.5 h-3.5 ${movie.is_watchlist ? 'fill-current' : ''}`} />
            {movie.is_watchlist ? 'Remove Queue' : 'Add to Queue'}
          </button>
        </li>
      )}
      {movie.status !== 'completed' && onMarkCompleted && (
        <li>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onMarkCompleted(movie)
            }} 
            className="text-accent-sage font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
          </button>
        </li>
      )}
      {onDelete && (
        <li>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onDelete(movie)
            }} 
            className="text-danger font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Movie
          </button>
        </li>
      )}
    </>
  )

  const quickIcons = (
    <div className="flex items-center gap-1">
      {movie.is_favorite && (
        <span title="Favorite" className="text-accent-ochre">
          <Star className="w-3.5 h-3.5 fill-current" />
        </span>
      )}
      {movie.is_watchlist && (
        <span title="Watchlist" className="text-accent-cyan">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </span>
      )}
      {movie.is_rewatch && (
        <span className="mono-badge mono-badge-vermillion text-[9px]">
          REW
        </span>
      )}
    </div>
  )

  return (
    <CardContainer
      layout={layout}
      onClick={() => navigate(`/movies/${movie.id}`)}
      className="card-accent-cyan"
    >
      <CardHeader
        layout={layout}
        title={movie.title}
        status={movie.status}
        statusColorClass={getStatusColorClass(movie.status)}
        statusDotClass={getStatusDotClass(movie.status)}
        icons={quickIcons}
        dropdownItems={dropdownItems}
        subtitle={
          <>
            {movie.year && <span>{movie.year}</span>}
            {movie.director && <span>• {movie.director}</span>}
            {movie.genre && <span>• {movie.genre}</span>}
          </>
        }
      />

      <CardStats layout={layout}>
        {movie.rating != null && (
          <StatItem
            icon={Star}
            label={<span className="font-mono text-accent-ochre font-bold">★ {movie.rating.toFixed(1)}/10</span>}
          />
        )}
        {movie.director && !isList && (
          <StatItem icon={User} label={movie.director} />
        )}
        {movie.genre && !isList && (
          <StatItem icon={Tag} label={movie.genre} />
        )}
        {movie.start_date && (
          <StatItem
            icon={Calendar}
            label={new Date(movie.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          />
        )}
        {movie.comments && movie.comments.length > 0 && (
          <StatItem
            icon={MessageSquare}
            label={`${movie.comments.length} log note${movie.comments.length > 1 ? 's' : ''}`}
          />
        )}
      </CardStats>

      {!isList && (
        <CardActions
          movie={movie}
          onEdit={onEdit}
          onMarkCompleted={onMarkCompleted}
          onRewatch={onRewatch}
          onViewHistory={onViewHistory}
        />
      )}
    </CardContainer>
  )
})
