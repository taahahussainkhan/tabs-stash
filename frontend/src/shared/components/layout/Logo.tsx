import { Link } from 'react-router-dom'
import { BookmarkCheck } from 'lucide-react'

interface Props {
  hideText?: boolean
  className?: string
  noLink?: boolean
}

export function Logo({ hideText = false, className = '', noLink = false }: Props) {
  const Content = () => (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <div className="w-8 h-8 rounded-[4px] bg-[#e05a47] border border-[#ff7b68] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0">
        <BookmarkCheck className="w-4 h-4 stroke-[2.5]" />
      </div>
      {!hideText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[15px] font-bold tracking-tight text-content-primary">Chronicle</span>
            <span className="text-[10px] font-mono font-bold text-accent-ochre bg-accent-ochre/10 px-1 py-0.5 rounded-[3px] border border-accent-ochre/20">LOG</span>
          </div>
          <span className="text-[10px] font-mono text-content-muted tracking-wider uppercase mt-0.5">Personal Archive</span>
        </div>
      )}
    </div>
  )

  if (noLink) return <Content />

  return (
    <Link to="/" className="inline-flex items-center">
      <Content />
    </Link>
  )
}
