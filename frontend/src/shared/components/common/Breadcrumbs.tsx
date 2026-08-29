import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  backHref: string
  backLabel?: string
  accentColor?: 'rose' | 'blue' | 'lavender' | 'amber' | 'sage'
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  backHref, 
  backLabel = 'Back',
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 mb-6 animate-in fade-in duration-200">
      <button
        onClick={() => navigate(backHref)}
        className="w-8 h-8 rounded-[4px] flex items-center justify-center bg-[#1e2026] border border-[#2e323c] text-content-secondary hover:text-white hover:bg-[#262830] transition-colors"
        title={backLabel}
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      <nav className="flex items-center gap-1.5 overflow-hidden text-xs">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-3 h-3 text-content-muted/40 shrink-0" />
            )}
            <div className="flex items-center gap-1.5 min-w-0">
              {item.href ? (
                <button
                  onClick={() => navigate(item.href!)}
                  className="text-content-muted font-medium hover:text-content-primary transition-colors whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : (
                <span className={`font-semibold truncate max-w-[200px] md:max-w-[400px] ${index === items.length - 1 ? 'text-content-primary' : 'text-content-muted'}`}>
                  {item.label}
                </span>
              )}
            </div>
          </React.Fragment>
        ))}
      </nav>
    </div>
  )
}
