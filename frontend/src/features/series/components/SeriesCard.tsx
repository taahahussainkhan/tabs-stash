import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { SeriesLog } from '../types/series'
import { 
  Star, Bookmark, Calendar, User, Tag, 
  CheckCircle2, Trash2, Layers
} from 'lucide-react'
import { getStatusColorClass, getStatusDotClass } from '../../../shared/utils/styles'
import { 
  CardContainer, 
  CardHeader, 
  CardStats, 
  StatItem 
} from '../../../shared/components/common/Card'
import { CardActions } from './card/CardActions'

interface SeriesCardProps {
  series: SeriesLog
  onEdit: (series: SeriesLog) => void
  onAddComments: (series: SeriesLog) => void
  onRewatch: (series: SeriesLog) => void
  onViewHistory: (series: SeriesLog) => void
  onMarkCompleted: (series: SeriesLog) => void
  onDelete?: (series: SeriesLog) => void
  onToggleFavorite?: (series: SeriesLog) => void | Promise<void>
  onToggleWatchlist?: (series: SeriesLog) => void | Promise<void>
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'list' | 'compact'
}

export const SeriesCard = memo(function SeriesCard({
  series,
  onEdit,
  onRewatch,
  onViewHistory,
  onMarkCompleted,
  onDelete,
  onToggleFavorite,
  onToggleWatchlist,
  layout = 'grid'
}: SeriesCardProps) {
  const navigate = useNavigate()
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    void onToggleFavorite?.(series)
  }

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    void onToggleWatchlist?.(series)
  }

  const isList = layout === 'list'

  const dropdownItems = (
    <>
      <li>
        <button onClick={handleToggleFavorite} className={series.is_favorite ? 'text-accent-ochre font-bold' : ''}>
          <Star className={`w-3.5 h-3.5 ${series.is_favorite ? 'fill-current' : ''}`} />
          {series.is_favorite ? 'Remove Favorite' : 'Add to Favorites'}
        </button>
      </li>
      {(series.status !== 'watching' && series.status !== 'rewatching') && (
        <li>
          <button onClick={handleToggleWatchlist} className={series.is_watchlist ? 'text-accent-ochre font-bold' : ''}>
            <Bookmark className={`w-3.5 h-3.5 ${series.is_watchlist ? 'fill-current' : ''}`} />
            {series.is_watchlist ? 'Remove Queue' : 'Add to Queue'}
          </button>
        </li>
      )}
      {series.status !== 'completed' && onMarkCompleted && (
        <li>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onMarkCompleted(series)
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
              onDelete(series)
            }} 
            className="text-danger font-bold"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Series
          </button>
        </li>
      )}
    </>
  )

  const quickIcons = (
    <div className="flex items-center gap-1">
      {series.is_favorite && (
        <span title="Favorite" className="text-accent-ochre">
          <Star className="w-3.5 h-3.5 fill-current" />
        </span>
      )}
      {series.is_watchlist && (
        <span title="Watchlist" className="text-accent-cyan">
          <Bookmark className="w-3.5 h-3.5 fill-current" />
        </span>
      )}
      {series.is_rewatch && (
        <span className="mono-badge mono-badge-vermillion text-[9px]">
          REW
        </span>
      )}
    </div>
  )

  return (
    <CardContainer
      layout={layout}
      onClick={() => navigate(`/series/${series.id}`)}
      className="card-accent-ochre"
    >
      <CardHeader
        layout={layout}
        title={series.title}
        status={series.status}
        statusColorClass={getStatusColorClass(series.status)}
        statusDotClass={getStatusDotClass(series.status)}
        icons={quickIcons}
        dropdownItems={dropdownItems}
        subtitle={
          <>
            {series.year && <span>{series.year}</span>}
            {series.creator && <span>• {series.creator}</span>}
            {series.genre && <span>• {series.genre}</span>}
          </>
        }
      />

      <CardStats layout={layout}>
        {series.rating != null && (
          <StatItem
            icon={Star}
            label={<span className="font-mono text-accent-ochre font-bold">★ {series.rating.toFixed(1)}/10</span>}
          />
        )}
        {series.total_episodes != null && series.total_episodes > 0 && (
          <StatItem
            icon={Layers}
            label={<span className="font-mono text-xs">{series.episodes_watched || 0}/{series.total_episodes} eps</span>}
          />
        )}
        {series.creator && !isList && (
          <StatItem icon={User} label={series.creator} />
        )}
        {series.genre && !isList && (
          <StatItem icon={Tag} label={series.genre} />
        )}
        {series.start_date && (
          <StatItem
            icon={Calendar}
            label={new Date(series.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          />
        )}
      </CardStats>

      {!isList && (
        <CardActions
          series={series}
          onEdit={onEdit}
          onMarkCompleted={onMarkCompleted}
          onRewatch={onRewatch}
          onViewHistory={onViewHistory}
        />
      )}
    </CardContainer>
  )
})
