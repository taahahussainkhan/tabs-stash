import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface VirtualizedGridProps<T> {
  data: T[]
  renderItem: (item: T) => React.ReactNode
  estimateItemHeight: number
  gap?: number
}

export function VirtualizedGrid<T>({ 
  data, 
  renderItem, 
  estimateItemHeight,
  gap = 24 
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(1)

  // Determine column count based on parent width
  useEffect(() => {
    const updateColumnCount = () => {
      if (!parentRef.current) return
      const width = parentRef.current.offsetWidth
      if (width >= 1280) setColumnCount(4)
      else if (width >= 1024) setColumnCount(3)
      else if (width >= 768) setColumnCount(2)
      else setColumnCount(1)
    }

    updateColumnCount()
    window.addEventListener('resize', updateColumnCount)
    return () => window.removeEventListener('resize', updateColumnCount)
  }, [])

  const rows = useMemo(() => {
    const r = []
    for (let i = 0; i < data.length; i += columnCount) {
      r.push(data.slice(i, i + columnCount))
    }
    return r
  }, [data, columnCount])

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateItemHeight + gap,
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className="overflow-auto w-full max-h-[800px] scrollbar-hide"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full grid gap-6"
            style={{
              height: `${virtualRow.size - gap}px`,
              transform: `translateY(${virtualRow.start}px)`,
              gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`
            }}
          >
            {rows[virtualRow.index].map((item, i) => (
              <div key={i}>
                {renderItem(item)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
