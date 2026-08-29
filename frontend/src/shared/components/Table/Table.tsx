import React, { useState, useEffect, useRef } from 'react'
import { MoreVertical } from 'lucide-react'
import { useVirtualizer } from '@tanstack/react-virtual'

export interface TableColumn<T = any> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
  width?: string
}

interface TableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  actions?: {
    label: string
    onClick: (row: T) => void
    className?: string
  }[]
  selectable?: boolean
  selectedRows?: T[]
  onSelectionChange?: (selected: T[]) => void
  estimateRowHeight?: number
}

export function Table<T extends object>({ 
  data, 
  columns, 
  actions,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  estimateRowHeight = 52
}: TableProps<T>) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const parentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedRows.length === 0) {
      setSelected(new Set())
    }
  }, [selectedRows])

  const getRowId = (row: T): string => {
    return (row as { public_id?: string }).public_id || (row as { id?: string }).id || JSON.stringify(row)
  }

  const isSelected = (row: T): boolean => {
    return selected.has(getRowId(row))
  }

  const isAllSelected = (): boolean => {
    return data.length > 0 && data.every(row => selected.has(getRowId(row)))
  }

  const handleSelectAll = () => {
    if (isAllSelected()) {
      setSelected(new Set())
      onSelectionChange?.([])
    } else {
      const newSelected = new Set(data.map(getRowId))
      setSelected(newSelected)
      onSelectionChange?.(data)
    }
  }

  const handleSelectRow = (row: T) => {
    const rowId = getRowId(row)
    const newSelected = new Set(selected)
    
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId)
    } else {
      newSelected.add(rowId)
    }
    
    setSelected(newSelected)
    
    const selectedData = data.filter(r => newSelected.has(getRowId(r)))
    onSelectionChange?.(selectedData)
  }

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan: 10,
  })

  if (data.length === 0) {
    return (
      <div className="border border-[#2e323c] rounded-[6px] bg-[#1e2026] p-12 text-center">
        <div className="w-10 h-10 rounded-[4px] bg-[#15161a] border border-[#2e323c] flex items-center justify-center mx-auto mb-3 text-content-muted">
          <MoreVertical className="w-4 h-4 opacity-40" />
        </div>
        <div className="mono-badge mono-badge text-[9px] mb-1 inline-block">TABLE ARCHIVE</div>
        <h4 className="text-xs font-bold text-content-primary font-mono uppercase">No Records Found</h4>
        <p className="text-[11px] text-content-muted mt-1 max-w-xs mx-auto">There are no records matching the current table query or filters.</p>
      </div>
    )
  }

  return (
    <div 
      ref={parentRef}
      className="overflow-auto w-full max-h-[700px] border border-[#2e323c] rounded-[6px] bg-[#1e2026]"
    >
      <div 
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <table className="w-full text-left border-collapse table-fixed">
          <thead className="sticky top-0 z-10 bg-[#17181d] border-b border-[#2e323c]">
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded-[2px] border-[#2e323c] bg-[#121316] text-[#e05a47] accent-[#e05a47] transition-all cursor-pointer"
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              <th className="px-4 py-3 w-12 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted">#</th>
              {columns.map((column) => (
                <th 
                  key={String(column.key)} 
                  className="px-4 py-3 text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 w-16"></th>}
            </tr>
          </thead>
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = data[virtualRow.index]
              return (
                <tr 
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={`hover:bg-[#262830] transition-colors group absolute w-full flex items-center border-b border-[#242730] ${
                    isSelected(row) ? 'bg-[#2a2223] border-l-2 border-l-[#e05a47]' : ''
                  }`}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {selectable && (
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded-[2px] border-[#2e323c] bg-[#121316] text-[#e05a47] accent-[#e05a47] transition-all cursor-pointer"
                        checked={isSelected(row)}
                        onChange={() => handleSelectRow(row)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 w-12 text-xs text-content-muted font-mono">{virtualRow.index + 1}</td>
                  {columns.map((column) => (
                    <td 
                      key={String(column.key)} 
                      className="px-4 py-3 text-xs text-content-secondary truncate"
                      style={{ width: column.width || 'auto', flex: column.width ? 'none' : '1' }}
                    >
                      {column.render ? column.render(row[column.key], row) : String(row[column.key] ?? '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 w-16 text-right">
                      <div className="relative inline-block text-left dropdown dropdown-end">
                        <button tabIndex={0} className="p-1 rounded-[4px] text-content-muted hover:text-content-primary hover:bg-[#262830] transition-all">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        <ul tabIndex={0} className="dropdown-content z-20 menu p-1 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl w-36 mt-1">
                          {actions.map((action, actionIndex) => (
                            <li key={actionIndex}>
                              <button 
                                onClick={() => action.onClick(row)}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] text-xs font-medium transition-colors hover:bg-[#262830] ${action.className || 'text-content-secondary'}`}
                              >
                                {action.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
