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
      accentColor: 'text-[#2dd4bf] border-[#134e4a] bg-[#0f2e2b]',
      hoverBorder: 'hover:border-[#2dd4bf]/40',
      available: true
    },
    {
      id: 'series',
      title: 'Television & Episodic Series',
      subtitle: 'Season architectures and episode trackers',
      icon: <Tv className="w-5 h-5" />,
      onClick: onSelectSeries,
      badge: 'TELEVISION',
      accentColor: 'text-[#fbbf24] border-[#78350f] bg-[#3b2c12]',
      hoverBorder: 'hover:border-[#fbbf24]/40',
      available: true
    },
    {
      id: 'book',
      title: 'Literature & Books',
      subtitle: 'Volumes, editions, authors, and marginalia',
      icon: <BookOpen className="w-5 h-5" />,
      onClick: onSelectBook,
      badge: 'LIBRARY',
      accentColor: 'text-[#818cf8] border-[#3730a3] bg-[#1e1b4b]',
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
      accentColor: 'text-[#4ade80] border-[#1e593a] bg-[#143324]',
      hoverBorder: 'hover:border-[#4ade80]/40',
      available: false
    }
  ]

  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
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
            {isWatchlistMode ? 'Queue Media Entry' : 'Log New Chronicle Entry'}
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
                p-4 rounded-[6px] border border-[#2e323c] bg-[#15161a] text-left transition-all relative group cursor-pointer
                ${type.available ? `${type.hoverBorder} hover:bg-[#1c1e24]` : 'opacity-40 cursor-not-allowed'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-[4px] border flex items-center justify-center ${type.accentColor}`}>
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
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-end bg-[#17181d] shrink-0">
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
