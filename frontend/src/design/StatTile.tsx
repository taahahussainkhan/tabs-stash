import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

interface StatTileProps {
  label: string
  value: number | string
  icon?: LucideIcon
  /** Any CSS colour; defaults to the brand primary. Drives the left rail. */
  accent?: string
  /** Optional footnote under the value (e.g. "12 this month"). */
  hint?: string
  to?: string
  onClick?: () => void
  className?: string
}

const BASE = 'stat-tile'

function StatBody({ label, value, icon: Icon, accent, hint }: StatTileProps) {
  return (
    <>
      <div className="min-w-0 pl-2">
        <div className="stat-tile-label truncate">{label}</div>
        <div className="stat-tile-value mt-1">{value}</div>
        {hint && <div className="mt-0.5 truncate text-[10px] text-content-muted">{hint}</div>}
      </div>
      {Icon && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]"
          style={{ backgroundColor: 'var(--surface-secondary)', color: accent ?? 'var(--primary)' }}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
    </>
  )
}

/**
 * Single number, its label and an accent rail — the web twin of the mobile
 * dashboard `StatGrid` cell. Renders as a link when `to` is provided.
 */
export function StatTile(props: StatTileProps) {
  const style = { '--stat-accent': props.accent ?? 'var(--primary)' } as CSSProperties

  if (props.to) {
    return (
      <Link to={props.to} className={cn(BASE, props.className)} style={style}>
        <StatBody {...props} />
      </Link>
    )
  }

  if (props.onClick) {
    return (
      <button type="button" onClick={props.onClick} className={cn(BASE, props.className)} style={style}>
        <StatBody {...props} />
      </button>
    )
  }

  return (
    <div className={cn(BASE, props.className)} style={style}>
      <StatBody {...props} />
    </div>
  )
}
