import { useNavigate } from 'react-router-dom'
import { Book, Film, Tv, Clock, Star, ArrowUpRight } from 'lucide-react'
import type { DashboardItem } from '../types/dashboard'

interface ItemSummaryCardProps {
  item: DashboardItem
}

export function ItemSummaryCard({ item }: ItemSummaryCardProps) {
  const navigate = useNavigate()

  const typeConfig = {
    book: {
      icon: Book,
      badge: 'mono-badge-indigo',
      borderLeft: 'border-l-accent-indigo',
      path: `/books/${item.id}`
    },
    movie: {
      icon: Film,
      badge: 'mono-badge-cyan',
      borderLeft: 'border-l-accent-cyan',
      path: `/movies/${item.id}`
    },
    series: {
      icon: Tv,
      badge: 'mono-badge-ochre',
      borderLeft: 'border-l-accent-ochre',
      path: `/series/${item.id}`
    }
  }

  const config = typeConfig[item.type as keyof typeof typeConfig] || {
    icon: Film,
    badge: 'mono-badge-neutral',
    borderLeft: 'border-l-accent-vermillion',
    path: `/movies/${item.id}`
  }
  const Icon = config.icon

  return (
    <div 
      onClick={() => navigate(config.path)}
      className={`group bg-[#1e2026] hover:bg-[#262830] rounded-[6px] p-4 transition-all duration-150 cursor-pointer border border-[#2e323c] border-l-[3px] ${config.borderLeft} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`mono-badge ${config.badge}`}>
            <Icon className="w-3 h-3" />
            <span>{item.type}</span>
          </span>

          <div className="w-6 h-6 rounded-[3px] bg-[#121316] border border-[#2e323c] flex items-center justify-center text-content-muted group-hover:text-white group-hover:border-[#3d4350] transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-content-primary mb-1 line-clamp-1 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        
        <p className="text-content-muted text-xs font-mono mb-4 line-clamp-1">
          {item.author_or_director || 'Creator unlisted'} {item.year ? `• ${item.year}` : ''}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#242730] text-xs font-mono">
        <div className="flex items-center gap-1 text-accent-ochre font-bold">
          <Star className="w-3.5 h-3.5 fill-accent-ochre" />
          <span>{item.rating != null ? item.rating.toFixed(1) : '—'}</span>
        </div>

        {item.status && (
          <div className="flex items-center gap-1.5 text-content-muted">
            <Clock className="w-3 h-3" />
            <span className="capitalize">{item.status.replace('_', ' ')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
