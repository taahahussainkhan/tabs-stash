import { Film, Tv, Book, FileText, X, Sparkles } from 'lucide-react'

interface AddContentModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'add' | 'watchlist'
  onSelectMovie: () => void
  onSelectSeries: () => void
  onSelectBook: () => void
  onSelectDocumentary?: () => void
  onSelectMagazine?: () => void
}

export function AddContentModal({ 
  isOpen,
  onClose, 
  mode = 'add',
  onSelectMovie, 
  onSelectSeries, 
  onSelectBook,
  onSelectDocumentary,
}: AddContentModalProps) {
  if (!isOpen) return null

  const isWatchlistMode = mode === 'watchlist'
  const title = isWatchlistMode ? 'The Queue' : 'New Entry'
  const subtitle = isWatchlistMode ? 'Save a narrative for a future chapter' : 'Select a medium to chronicle your journey'

  const contentTypes = [
    {
      id: 'book',
      title: 'Book',
      description: 'Literature',
      icon: <Book className="w-5 h-5" />,
      onClick: onSelectBook,
      color: 'text-pastel-sage',
      bg: 'bg-pastel-sage/10',
      available: true
    },
    {
      id: 'movie',
      title: 'Movie',
      description: 'Cinema',
      icon: <Film className="w-5 h-5" />,
      onClick: onSelectMovie,
      color: 'text-pastel-blue',
      bg: 'bg-pastel-blue/10',
      available: true
    },
    {
      id: 'series',
      title: 'Series',
      description: 'Television',
      icon: <Tv className="w-5 h-5" />,
      onClick: onSelectSeries,
      color: 'text-pastel-amber',
      bg: 'bg-pastel-amber/10',
      available: true
    },
    {
      id: 'documentary',
      title: 'Doc',
      description: 'Archive',
      icon: <FileText className="w-5 h-5" />,
      onClick: onSelectDocumentary || (() => {}),
      color: 'text-pastel-slate',
      bg: 'bg-pastel-slate/10',
      available: !!onSelectDocumentary
    }
  ].filter(type => type.available)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-surface border border-white/5 p-12 rounded-5xl shadow-soft animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 text-content-secondary hover:text-content-primary transition-colors hover:bg-white/5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-pastel-blue" />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-content-muted">{mode} Mode</span>
          </div>
          <h2 className="text-5xl font-serif text-content-primary mb-4 tracking-tight">{title}</h2>
          <p className="text-content-secondary text-base font-light italic leading-relaxed opacity-60">
            {subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                type.onClick()
                onClose()
              }}
              className="group flex flex-col items-center gap-6 p-8 rounded-4xl bg-surface-light border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-500 text-center"
            >
              <div className={`w-16 h-16 rounded-3xl ${type.bg} ${type.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-12 duration-500 shadow-soft`}>
                {type.icon}
              </div>
              <div>
                <h3 className="text-xl font-serif text-content-primary mb-1">{type.title}</h3>
                <p className="text-[10px] text-content-muted uppercase tracking-widest font-bold opacity-60">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-[10px] text-content-muted uppercase tracking-[0.3em] font-medium opacity-40">
            Your journey continues with every log
          </p>
        </div>
      </div>
    </div>
  )
}
