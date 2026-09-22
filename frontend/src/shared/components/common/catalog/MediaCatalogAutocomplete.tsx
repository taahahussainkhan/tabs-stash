import { useState, useEffect, useRef } from 'react'
import { Sparkles, Film, Tv, Loader2, Star, Check, ArrowRight } from 'lucide-react'
import {
  mediaCatalogService,
  type MediaCatalogSearchResult,
  type MediaCatalogItemDetails,
} from '../../../../services/mediaCatalogService'

interface MediaCatalogAutocompleteProps {
  query: string
  type: 'movie' | 'series'
  isOpen: boolean
  onClose: () => void
  onSelect: (details: MediaCatalogItemDetails) => void
  anchorRef?: React.RefObject<HTMLElement | null>
}

export function MediaCatalogAutocomplete({
  query,
  type,
  isOpen,
  onClose,
  onSelect,
  anchorRef,
}: MediaCatalogAutocompleteProps) {
  const [results, setResults] = useState<MediaCatalogSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingId, setFetchingId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    const trimmed = (query || '').trim()
    if (!isOpen || trimmed.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const data = await mediaCatalogService.search(trimmed, type)
        setResults(data)
        setSelectedIndex(-1)
      } catch (err) {
        console.error('[MediaCatalogAutocomplete] Search error:', err)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query, type, isOpen])

  // Handle outside clicks
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!anchorRef?.current || !anchorRef.current.contains(target))
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose, anchorRef])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen || results.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
      } else if (e.key === 'Enter' && selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault()
        handleItemClick(results[selectedIndex])
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  const handleItemClick = async (item: MediaCatalogSearchResult) => {
    try {
      setFetchingId(item.id)
      const details = await mediaCatalogService.getDetails(item.id, item.type)
      if (details) {
        onSelect(details)
      }
      onClose()
    } catch (err) {
      console.error('[MediaCatalogAutocomplete] Failed to fetch media details:', err)
    } finally {
      setFetchingId(null)
    }
  }

  const trimmedQuery = (query || '').trim()

  // Only render if opened and has at least 2 characters
  if (!isOpen || trimmedQuery.length < 2) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 z-[9999] bg-[#161820] border border-[#2e323c] rounded-[8px] shadow-2xl overflow-hidden flex flex-col max-h-[380px] animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#101115] border-b border-[#242730] text-[11px] font-mono uppercase tracking-wider">
        <div className="flex items-center gap-1.5 text-accent-cyan font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Catalog Suggestions for "{trimmedQuery}"</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-1.5 text-accent-cyan text-[10px]">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Searching...</span>
          </div>
        ) : (
          <span className="text-[10px] text-content-muted">
            {results.length} match{results.length === 1 ? '' : 'es'}
          </span>
        )}
      </div>

      {/* Body: Loading skeletons vs Results list vs Empty message */}
      <div className="overflow-y-auto custom-scrollbar divide-y divide-[#242730]/60 flex-1">
        {loading && results.length === 0 ? (
          <div className="p-3 space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse p-1">
                <div className="w-10 h-14 bg-[#232630] rounded-[4px] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-[#232630] rounded w-2/3" />
                  <div className="h-2.5 bg-[#232630]/60 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="p-5 text-center text-xs text-content-muted font-mono space-y-1">
            <p>No catalog matches for "{trimmedQuery}"</p>
            <p className="text-[10px] text-content-secondary">
              You can keep typing to save your custom title.
            </p>
          </div>
        ) : (
          results.map((item, index) => {
            const isSelected = selectedIndex === index
            const isFetching = fetchingId === item.id
            const isSeries = item.type === 'series'

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                disabled={isFetching}
                className={`w-full p-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer group border-l-2 ${
                  isSelected
                    ? 'bg-[#222530] border-accent-cyan text-white'
                    : 'hover:bg-[#1a1c24] border-transparent text-content-primary'
                } ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Poster Thumbnail */}
                <div className="w-10 h-14 rounded-[4px] bg-[#0c0d10] border border-[#2e323c] overflow-hidden shrink-0 flex items-center justify-center">
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : isSeries ? (
                    <Tv className="w-4 h-4 text-accent-ochre" />
                  ) : (
                    <Film className="w-4 h-4 text-accent-cyan" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs sm:text-sm font-semibold text-content-primary group-hover:text-white truncate">
                      {item.title}
                    </span>
                    {item.year && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#252832] text-content-secondary rounded shrink-0">
                        {item.year}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded shrink-0 ${
                        isSeries
                          ? 'bg-[#3b2c12] text-[#fbbf24]'
                          : 'bg-[#0f2e2b] text-[#2dd4bf]'
                      }`}
                    >
                      {isSeries ? 'Series' : 'Cinema'}
                    </span>
                  </div>

                  {/* Genres & Rating */}
                  <div className="flex items-center gap-2 text-[11px] text-content-muted">
                    {item.genres && item.genres.length > 0 && (
                      <span className="font-sans text-[11px] text-content-secondary truncate">
                        {item.genres.slice(0, 3).join(', ')}
                      </span>
                    )}
                    {item.voteAverage && item.voteAverage > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-400 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400" />
                        {item.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {item.overview && (
                    <p className="text-[10px] text-content-muted/70 truncate mt-0.5 font-sans">
                      {item.overview}
                    </p>
                  )}
                </div>

                {/* Action button */}
                <div className="shrink-0 text-right pr-1 font-mono text-[11px]">
                  {isFetching ? (
                    <div className="flex items-center gap-1 text-accent-cyan text-xs">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : isSelected ? (
                    <span className="text-accent-cyan flex items-center gap-1 font-medium bg-[#132c2c] px-2 py-0.5 rounded border border-[#1d4d4d]">
                      <Check className="w-3 h-3" /> Auto-fill
                    </span>
                  ) : (
                    <span className="text-content-muted/60 group-hover:text-accent-cyan flex items-center gap-0.5 text-[10px]">
                      <span>Select</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Footer helper */}
      <div className="px-3 py-1.5 bg-[#101115] border-t border-[#242730] flex items-center justify-between text-[10px] font-mono text-content-muted">
        <span>Click item or press Enter to auto-populate</span>
        <span>Esc to close</span>
      </div>
    </div>
  )
}
