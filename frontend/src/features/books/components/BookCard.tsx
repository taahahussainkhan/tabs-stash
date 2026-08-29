import React, { memo } from 'react'
import type { BookItem } from '../types/book'
import { BookOpen, Edit, Trash2, ExternalLink } from 'lucide-react'
import {
  CardContainer,
  CardHeader,
  CardImage
} from '../../../shared/components/common/Card'

interface BookCardProps {
  item: BookItem
  size?: 'small' | 'medium' | 'large'
  layout?: 'grid' | 'compact' | 'list'
  onEdit?: (item: BookItem) => void
  onDelete?: (item: BookItem) => void
  onViewDetails?: (item: BookItem) => void
}

export const BookCard: React.FC<BookCardProps> = memo(({
  item,
  size = 'medium',
  layout = 'grid',
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const { edition } = item
  const book = edition?.book
  const authors = book?.authors || []
  const authorNames = authors.map(a => a.name).join(', ')

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'owned': return 'mono-badge-sage'
      case 'wishlist': return 'mono-badge-ochre'
      case 'reading': return 'mono-badge-cyan'
      default: return 'mono-badge-indigo'
    }
  }

  const isList = layout === 'list'

  const dropdownItems = (
    <>
      <li>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit?.(item)
          }}
          className="flex items-center gap-2 text-xs font-semibold py-1.5 rounded-[3px]"
        >
          <Edit size={13} /> Edit Volume
        </button>
      </li>
      <li>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete?.(item)
          }}
          className="flex items-center gap-2 text-xs font-semibold py-1.5 rounded-[3px] text-danger"
        >
          <Trash2 size={13} /> Delete Entry
        </button>
      </li>
    </>
  )

  const quickIcons = (
    <div className="flex items-center gap-1">
      {edition?.format && (
        <span className="mono-badge mono-badge-neutral text-[9px]">
          {edition.format}
        </span>
      )}
    </div>
  )

  return (
    <CardContainer
      layout={layout}
      size={size}
      onClick={() => onViewDetails?.(item)}
      className="card-accent-indigo"
    >
      <CardImage
        src={edition?.cover_image}
        alt={book?.title}
        fallbackIcon={<BookOpen size={isList ? 20 : 40} />}
        layout={layout}
        statusBadge={
          <span className={`mono-badge ${getStatusBadge(item.ownership_status)}`}>
            {item.ownership_status}
          </span>
        }
      />

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <CardHeader
          layout={layout}
          title={book?.title || 'Untitled Book'}
          status={item.ownership_status}
          statusColorClass={getStatusBadge(item.ownership_status)}
          icons={quickIcons}
          dropdownItems={dropdownItems}
          subtitle={authorNames ? <span>By {authorNames}</span> : undefined}
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#242730] text-xs font-mono text-content-muted">
          <span>{edition?.publisher?.name || 'Publisher unlisted'}</span>
          {edition?.pages_count && <span>{edition.pages_count}p</span>}
        </div>
      </div>
    </CardContainer>
  )
})
