import { Film, Tv, BookOpen, FileText, ArrowRight, X } from 'lucide-react'

interface AddContentModalContentProps {
  onClose: () => void
  mode?: 'add' | 'watchlist'
  onSelectMovie: () => void
  onSelectSeries: () => void
  onSelectBook: () => void
  onSelectDocumentary?: () => void
}

export function AddContentModalContent({
  onClose,
  mode = 'add',
  onSelectMovie,
  onSelectSeries,
  onSelectBook,
  onSelectDocumentary,
}: AddContentModalContentProps) {
  const isWatchlistMode = mode === 'watchlist'

  const contentTypes = [
    {
      id: 'movie',
      title: 'Cinema & Feature Film',
      subtitle: 'Single viewing film experiences and logs',
      icon: <Film className="w-5 h-5" />,
      onClick: onSelectMovie,
      badge: 'CINEMA',
      accentColor: 'text-[var(--accent-sage)] border-[var(--success)] bg-[var(--success-soft)]',
      hoverBorder: 'hover:border-[var(--accent-sage)]/40',
      available: true
    },
    {
      id: 'series',
      title: 'Television & Episodic Series',
      subtitle: 'Season architectures and episode trackers',
      icon: <Tv className="w-5 h-5" />,
      onClick: onSelectSeries,
      badge: 'TELEVISION',
      accentColor: 'text-[var(--warning)] border-[var(--warning)] bg-[var(--warning-soft)]',
      hoverBorder: 'hover:border-[var(--warning)]/40',
      available: true
    },
    {
      id: 'book',
      title: 'Literature & Books',
      subtitle: 'Volumes, editions, authors, and marginalia',
      icon: <BookOpen className="w-5 h-5" />,
      onClick: onSelectBook,
      badge: 'LIBRARY',
      accentColor: 'text-[#818cf8] border-[var(--accent-indigo)] bg-[var(--primary-soft)]',
      hoverBorder: 'hover:border-[#818cf8]/40',
      available: true
    },
    {
      id: 'documentary',
      title: 'Documentaries & Specials',
      subtitle: 'Non-fiction and academic features',
      icon: <FileText className="w-5 h-5" />,
      onClick: onSelectDocumentary || onSelectMovie,
      badge: 'DOCS',
      accentColor: 'text-[var(--success)] border-[var(--success)] bg-[var(--success-soft)]',
      hoverBorder: 'hover:border-[var(--success)]/40',
      available: false
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-vermillion text-[9px]">
              {isWatchlistMode ? 'QUEUE SELECTOR' : 'LOG SELECTOR'}
            </span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">Medium Category</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            {isWatchlistMode ? 'Queue Media Entry' : 'Log New Lore Entry'}
          </h2>
          <p className="text-xs text-content-secondary">
            Select the medium category to open its specialized specification sheet.
          </p>
        </div>

        {/* Medium Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                if (!type.available) return
                onClose()
                type.onClick()
              }}
              disabled={!type.available}
              className={`
                p-4 rounded-[var(--radius-md)] border border-[var(--border-color)] bg-[var(--surface-input)] text-left transition-all relative group cursor-pointer
                ${type.available ? `${type.hoverBorder} hover:bg-[#1c1e24]` : 'opacity-40 cursor-not-allowed'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-[var(--radius-sm)] border flex items-center justify-center ${type.accentColor}`}>
                  {type.icon}
                </div>
                <span className="mono-badge mono-badge-neutral text-[9px]">
                  {type.available ? type.badge : 'COMING SOON'}
                </span>
              </div>

              <h4 className="text-sm font-bold text-content-primary group-hover:text-white transition-colors">
                {type.title}
              </h4>
              <p className="text-xs text-content-muted mt-1 leading-relaxed">
                {type.subtitle}
              </p>

              {type.available && (
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-accent-vermillion mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open Spec Sheet</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[var(--border-color)] flex items-center justify-end bg-[var(--surface-sidebar)] shrink-0">
        <button 
          type="button" 
          className="text-xs font-medium text-content-muted hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  )
}
