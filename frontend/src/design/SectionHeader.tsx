import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

interface SectionHeaderProps {
  title: string
  /** Optional count badge, mirrors the "Movies (69)" pattern. */
  count?: number
  subtitle?: string
  icon?: LucideIcon
  /** Where "View all" points; omit to hide the link. */
  viewAllTo?: string
  action?: React.ReactNode
  className?: string
}

/**
 * Heading for a content strip or table. Kept separate from PageHeader so
 * pages can stack as many grouped sections as they need.
 */
export function SectionHeader({
  title,
  count,
  subtitle,
  icon: Icon,
  viewAllTo,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 pb-3 section-rule', className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {Icon && <Icon className="h-4 w-4 shrink-0" style={{ color: 'var(--primary)' }} />}
        <h2 className="truncate text-base font-bold tracking-tight text-content-primary">
          {title}
          {typeof count === 'number' && (
            <span className="ml-1.5 font-mono text-xs font-semibold text-content-muted">
              ({count})
            </span>
          )}
        </h2>
        {subtitle && <span className="truncate text-[11px] text-content-muted">/ {subtitle}</span>}
      </div>

      {action}

      {viewAllTo && (
        <Link
          to={viewAllTo}
          className="flex items-center gap-1.5 text-[11px] font-bold text-content-secondary transition-colors hover:text-content-primary"
        >
          <span>View all</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}
