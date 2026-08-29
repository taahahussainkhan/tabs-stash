import React from 'react'
import type { BookItem } from '../types/book'
import { Table } from '../../../shared/components/Table/Table'
import { formatDate } from '../../../shared/utils/date'

interface BookTableProps {
  books: BookItem[]
  onEdit?: (item: BookItem) => void
  onDelete?: (item: BookItem) => void
  onViewDetails?: (item: BookItem) => void
}

export const BookTable: React.FC<BookTableProps> = ({
  books,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'owned':
        return 'mono-badge-sage'
      case 'wishlist':
        return 'mono-badge-ochre'
      case 'sold':
      case 'gifted':
        return 'mono-badge-neutral'
      case 'lost':
        return 'mono-badge-danger'
      default:
        return 'mono-badge-indigo'
    }
  }

  const columns = [
    {
      key: 'title' as keyof BookItem,
      header: 'Title',
      render: (_: unknown, item: BookItem) => (
        <div>
          <div className="font-semibold text-content-primary hover:text-accent-indigo transition-colors cursor-pointer" onClick={() => onViewDetails?.(item)}>
            {item.edition?.book?.title || 'Unknown Title'}
          </div>
          {item.edition?.format && (
            <span className="mono-badge mono-badge-neutral text-[9px] mt-1">
              {item.edition.format}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'author' as keyof BookItem,
      header: 'Author',
      render: (_: unknown, item: BookItem) => (
        <span className="text-xs font-mono text-content-secondary">
          {item.edition?.book?.authors?.map(a => a.name).join(', ') || '-'}
        </span>
      )
    },
    {
      key: 'publisher' as keyof BookItem,
      header: 'Publisher',
      render: (_: unknown, item: BookItem) => (
        <span className="text-xs font-mono text-content-muted">
          {item.edition?.publisher?.name || '-'}
        </span>
      )
    },
    {
      key: 'language' as keyof BookItem,
      header: 'Lang',
      render: (_: unknown, item: BookItem) => (
        <span className="text-xs font-mono text-content-muted">
          {item.edition?.language || '-'}
        </span>
      )
    },
    {
      key: 'ownership_status' as keyof BookItem,
      header: 'Status',
      render: (value: unknown) => (
        <span className={`mono-badge ${getStatusBadge(value as string)} text-[10px]`}>
          {value as string}
        </span>
      )
    },
    {
      key: 'order_placed_date' as keyof BookItem,
      header: 'Acquired',
      render: (value: unknown) => (
        <span className="text-xs font-mono text-content-muted">
          {formatDate(value as string | undefined)}
        </span>
      )
    },
  ]

  const actions = [
    ...(onViewDetails ? [{
      label: 'View Details',
      onClick: (item: BookItem) => onViewDetails(item)
    }] : []),
    ...(onEdit ? [{
      label: 'Edit',
      onClick: (item: BookItem) => onEdit(item)
    }] : []),
    ...(onDelete ? [{
      label: 'Delete',
      onClick: (item: BookItem) => onDelete(item),
      className: 'text-danger' as const
    }] : []),
  ]

  return (
    <Table<BookItem>
      data={books}
      columns={columns}
      actions={actions}
    />
  )
}
