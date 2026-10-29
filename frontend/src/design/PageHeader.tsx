import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface PageHeaderProps {
  /** Small uppercase kicker above the title, e.g. "Archive / Dashboard". */
  eyebrow?: string
  /** Colour of the eyebrow dot, defaults to the brand primary. */
  tone?: 'primary' | 'ochre' | 'sage' | 'cyan'
  title: string
  description?: string
  /** Right-aligned controls (primary action, filters, …). */
  actions?: ReactNode
  className?: string
}

const TONE_VAR: Record<NonNullable<PageHeaderProps['tone']>, string> = {
  primary: 'var(--primary)',
  ochre: 'var(--accent-ochre)',
  sage: 'var(--accent-sage)',
  cyan: 'var(--accent-cyan)',
}

/**
 * Screen title block. Mirrors the mobile `ScreenHeader`: eyebrow, display
 * title, muted description and an optional action cluster on the right.
 */
export function PageHeader({ eyebrow, tone = 'primary', title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-5 pb-6 section-rule md:flex-row md:items-end md:justify-between',
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: TONE_VAR[tone] }}
            />
            <span className="eyebrow" style={{ color: TONE_VAR[tone] }}>
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="truncate text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-xs text-content-secondary">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2.5">{actions}</div>}
    </header>
  )
}
