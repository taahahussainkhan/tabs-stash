import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface ChipProps {
  active?: boolean
  onClick?: () => void
  children: ReactNode
  icon?: ReactNode
  className?: string
  title?: string
}

/** Filter / toggle pill, shared by toolbars and segmented lists. */
export function Chip({ active = false, onClick, children, icon, className, title }: ChipProps) {
  const classes = cn('chip', active && 'chip-active', className)

  if (!onClick) {
    return (
      <span className={classes} title={title}>
        {icon}
        {children}
      </span>
    )
  }

  return (
    <button type="button" onClick={onClick} className={classes} title={title} aria-pressed={active}>
      {icon}
      {children}
    </button>
  )
}
