import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, hasNext, hasPrev }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
    const maxVisible = isMobile ? 3 : 5
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 font-mono text-xs">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#1e2026] border border-[#2e323c] text-content-secondary hover:text-white hover:bg-[#262830] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Prev</span>
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-content-muted">
                ...
              </span>
            )
          }
          
          const isCurrent = currentPage === page
          return (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-7 h-7 rounded-[4px] font-bold text-xs flex items-center justify-center transition-colors border ${
                isCurrent 
                  ? 'bg-[#e05a47] text-white border-[#ff7b68]' 
                  : 'bg-[#1e2026] border-[#2e323c] text-content-secondary hover:text-white hover:bg-[#262830]'
              }`}
            >
              {page}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-[4px] bg-[#1e2026] border border-[#2e323c] text-content-secondary hover:text-white hover:bg-[#262830] disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
