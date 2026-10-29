import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'
import { cn } from '../lib/utils'

export interface FabAction {
  key: string
  label: string
  icon: LucideIcon
  onSelect: () => void
  /** Any CSS colour used for the glyph bubble. */
  accent?: string
}

interface FabProps {
  actions: FabAction[]
  /** Accessible label for the closed trigger. */
  label?: string
  className?: string
}

/**
 * Floating action button with a vertical action fan.
 *
 * Deliberately identical in behaviour to the mobile `design/Fab` so a user who
 * learned one learns the other: the trigger rotates into a close icon, the
 * actions stack upwards, Escape or a backdrop click dismisses.
 */
export function Fab({ actions, label = 'New entry', className }: FabProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (actions.length === 0) return null

  // Portalled to <body>: page-level wrappers animate with a transform, which
  // would otherwise become the containing block for position: fixed.
  return createPortal(
    <>
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-black/45 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={cn('fab', className)}>
        {open && (
          <div className="fab-actions">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <button
                  key={action.key}
                  type="button"
                  className="fab-action"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => {
                    setOpen(false)
                    action.onSelect()
                  }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
                    {action.label}
                  </span>
                  <span
                    className="fab-glyph"
                    style={{ backgroundColor: action.accent ?? 'var(--primary)' }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          className="fab-trigger"
          aria-label={open ? 'Close actions' : label}
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </>,
    document.body
  )
}
