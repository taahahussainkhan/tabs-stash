import { Search, Film, Tv, Book, Loader2, X } from 'lucide-react'
import { useGlobalSearch } from '../../../features/home/hooks/useGlobalSearch'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const { query, setQuery, results, isLoading } = useGlobalSearch()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleResultClick = (id: string, type: 'movie' | 'series' | 'book') => {
    setIsOpen(false)
    setQuery('')
    navigate(`/${type}s/${id}`)
  }

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'movie':
        return { icon: <Film className="w-3.5 h-3.5 text-accent-cyan" />, badge: 'mono-badge-cyan', label: 'CINEMA' }
      case 'series':
        return { icon: <Tv className="w-3.5 h-3.5 text-accent-ochre" />, badge: 'mono-badge-ochre', label: 'SERIES' }
      case 'book':
        return { icon: <Book className="w-3.5 h-3.5 text-accent-indigo" />, badge: 'mono-badge-indigo', label: 'BOOK' }
      default:
        return { icon: <Search className="w-3.5 h-3.5 text-content-muted" />, badge: 'mono-badge-neutral', label: 'ITEM' }
    }
  }

  return (
    <div className="relative w-full">
      <div 
        className="flex items-center gap-2 bg-[#121316] border border-[#2e323c] rounded-[4px] px-2.5 py-1.5 w-full cursor-text hover:border-[#3d424f] transition-colors group"
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
      >
        <Search className="w-3.5 h-3.5 text-content-muted group-hover:text-content-secondary transition-colors shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search logs, titles, genres..."
          className="bg-transparent border-none outline-none text-xs text-content-primary placeholder:text-content-muted w-full font-sans"
        />

        {query ? (
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setQuery('')
            }} 
            className="p-0.5 hover:bg-[#1e2026] rounded text-content-muted hover:text-content-primary"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center text-[9px] font-mono text-content-muted bg-[#1e2026] border border-[#2e323c] px-1.5 py-0.5 rounded-[3px] shrink-0">
            ⌘K
          </kbd>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div 
          ref={resultsRef}
          className="absolute top-10 left-0 right-0 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 min-w-[320px]"
        >
          <div className="px-3 py-2 border-b border-[#2e323c] bg-[#17181d] flex items-center justify-between">
            <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider">Search Results</span>
            <span className="text-[10px] font-mono text-accent-ochre">{results.length} found</span>
          </div>

          {isLoading ? (
            <div className="p-6 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-accent-vermillion animate-spin" />
              <span className="text-xs font-mono text-content-muted">Searching archive...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-1 max-h-72 overflow-y-auto divide-y divide-[#242730]">
              {results.map((result) => {
                const { icon, badge, label } = getBadgeStyle(result.type)
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result.id, result.type)}
                    className="w-full flex items-center justify-between gap-3 p-2.5 hover:bg-[#262830] transition-colors text-left rounded-[4px]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-[4px] bg-[#121316] border border-[#2e323c] flex items-center justify-center shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-content-primary truncate">{result.title}</div>
                        <div className="text-[10px] font-mono text-content-muted truncate">
                          {result.subtitle || 'Personal Log'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`mono-badge ${badge}`}>
                        {label}
                      </span>
                      {result.status && (
                        <span className="mono-badge mono-badge-neutral">
                          {result.status}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-xs font-mono text-content-muted">No matching logs in archive</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
