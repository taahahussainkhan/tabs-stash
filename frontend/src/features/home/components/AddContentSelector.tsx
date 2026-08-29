import { Film, Tv, Book } from 'lucide-react'

interface AddContentSelectorProps {
  onClose: () => void
  onSelectMovie: () => void
  onSelectSeries: () => void
  onSelectBook: () => void
}

export function AddContentSelector({ 
  onClose, 
  onSelectMovie, 
  onSelectSeries, 
  onSelectBook 
}: AddContentSelectorProps) {
  const contentTypes = [
    {
      id: 'movie',
      label: 'Cinema / Movie',
      icon: <Film className="w-5 h-5 text-accent-cyan" />,
      description: 'Log a feature film, documentary or short',
      onClick: onSelectMovie,
      badge: 'mono-badge-cyan',
      borderLeft: 'border-l-accent-cyan',
    },
    {
      id: 'series',
      label: 'Television Series',
      icon: <Tv className="w-5 h-5 text-accent-ochre" />,
      description: 'Track seasons, episodes and rewatches',
      onClick: onSelectSeries,
      badge: 'mono-badge-ochre',
      borderLeft: 'border-l-accent-ochre',
    },
    {
      id: 'book',
      label: 'Book / Literature',
      icon: <Book className="w-5 h-5 text-accent-indigo" />,
      description: 'Log novels, audiobooks and reading logs',
      onClick: onSelectBook,
      badge: 'mono-badge-indigo',
      borderLeft: 'border-l-accent-indigo',
    },
  ]

  return (
    <div className="space-y-4">
      <p className="text-xs text-content-secondary font-sans">
        Select media type to record into your local chronicle:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              type.onClick()
              onClose()
            }}
            className={`p-4 bg-[#1e2026] hover:bg-[#262830] border border-[#2e323c] border-l-[3px] ${type.borderLeft} rounded-[6px] text-left transition-all duration-150 group cursor-pointer`}
          >
            <div className="w-8 h-8 rounded-[4px] bg-[#121316] border border-[#2e323c] flex items-center justify-center mb-3">
              {type.icon}
            </div>
            <div className="text-xs font-bold text-content-primary mb-1 group-hover:text-white">
              {type.label}
            </div>
            <p className="text-[11px] font-mono text-content-muted leading-relaxed">
              {type.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
