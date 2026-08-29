import { Trash2, Download, FileText, X, CheckSquare, GripHorizontal } from 'lucide-react'
import type { MovieLog } from '../../../features/movies/types/movie'
import { exportToCSV, exportToPDF } from '../../../utils/exportUtils'
import { useState, useRef, useEffect } from 'react'

interface BulkActionsToolbarProps {
  selectedCount: number
  selectedMovies: MovieLog[]
  onDelete: () => void
  onClearSelection: () => void
}

export function BulkActionsToolbar({
  selectedCount,
  selectedMovies,
  onDelete,
  onClearSelection
}: BulkActionsToolbarProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      setPosition({ x: positionRef.current.x + dx, y: positionRef.current.y + dy })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      positionRef.current = { x: position.x, y: position.y }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, position])

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    positionRef.current = { ...position }
  }

  if (selectedCount === 0) return null

  const handleExportCSV = () => {
    exportToCSV(selectedMovies, `movies-export-${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div
      className="fixed z-50 w-[90%] sm:w-auto max-w-lg cursor-move"
      style={{
        left: '50%',
        bottom: '1.5rem',
        transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`
      }}
    >
      <div className="bg-[#1e2026] text-content-primary border border-[#2e323c] shadow-2xl rounded-[6px] px-3.5 py-2 flex items-center justify-between gap-3">
        <div
          className="cursor-move text-content-muted hover:text-content-primary transition-colors"
          onMouseDown={handleDragStart}
        >
          <GripHorizontal className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-accent-vermillion">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{selectedCount} SELECTED</span>
        </div>

        <div className="h-4 w-px bg-[#2e323c]" />

        <div className="flex items-center gap-1.5">
          <div className="dropdown dropdown-top dropdown-end">
            <button tabIndex={0} className="px-2.5 py-1 rounded-[3px] bg-[#121316] border border-[#2e323c] text-xs font-semibold hover:bg-[#262830] transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>Export</span>
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-1 bg-[#1e2026] border border-[#2e323c] rounded-[4px] shadow-2xl w-32 mb-1">
              <li>
                <button onClick={handleExportCSV} className="text-xs py-1">
                  <FileText className="w-3 h-3" /> CSV
                </button>
              </li>
              <li>
                <button onClick={() => exportToPDF(selectedMovies)} className="text-xs py-1">
                  <FileText className="w-3 h-3" /> PDF
                </button>
              </li>
            </ul>
          </div>

          <button
            className="px-2.5 py-1 rounded-[3px] bg-[#271414] border border-danger/40 text-danger hover:bg-[#3b1818] text-xs font-semibold transition-colors flex items-center gap-1"
            onClick={onDelete}
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>

          <button
            className="p-1 rounded-[3px] hover:bg-[#262830] text-content-muted hover:text-white transition-colors ml-1"
            onClick={onClearSelection}
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
