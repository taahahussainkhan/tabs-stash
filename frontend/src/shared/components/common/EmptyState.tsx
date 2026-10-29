import React from 'react'
import { Plus, type LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode
  badge?: string
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
  actionIcon?: LucideIcon | React.ReactNode
  secondaryActionText?: string
  onSecondaryAction?: () => void
  secondaryActionIcon?: LucideIcon | React.ReactNode
  accent?: 'vermillion' | 'ochre' | 'sage' | 'cyan' | 'indigo' | 'slate'
  compact?: boolean
  className?: string
  children?: React.ReactNode
}

const accentConfig = {
  vermillion: {
    badge: 'mono-badge-vermillion',
    iconBorder: 'border-[var(--danger)]',
    iconBg: 'bg-[var(--primary-soft)]',
    iconColor: 'text-[var(--primary)]',
    borderLeft: 'border-l-accent-vermillion',
  },
  ochre: {
    badge: 'mono-badge-ochre',
    iconBorder: 'border-[var(--warning)]',
    iconBg: 'bg-[var(--warning-soft)]',
    iconColor: 'text-[var(--warning)]',
    borderLeft: 'border-l-accent-ochre',
  },
  sage: {
    badge: 'mono-badge-sage',
    iconBorder: 'border-[var(--success)]',
    iconBg: 'bg-[var(--success-soft)]',
    iconColor: 'text-[var(--success)]',
    borderLeft: 'border-l-accent-sage',
  },
  cyan: {
    badge: 'mono-badge-cyan',
    iconBorder: 'border-[var(--success)]',
    iconBg: 'bg-[var(--success-soft)]',
    iconColor: 'text-[var(--accent-sage)]',
    borderLeft: 'border-l-accent-cyan',
  },
  indigo: {
    badge: 'mono-badge-indigo',
    iconBorder: 'border-[var(--accent-indigo)]',
    iconBg: 'bg-[var(--primary-soft)]',
    iconColor: 'text-[#818cf8]',
    borderLeft: 'border-l-accent-indigo',
  },
  slate: {
    badge: 'mono-badge',
    iconBorder: 'border-[var(--border-color)]',
    iconBg: 'bg-[var(--surface-input)]',
    iconColor: 'text-content-muted',
    borderLeft: 'border-l-[var(--border-color)]',
  },
}

export function EmptyState({
  icon,
  badge,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  secondaryActionText,
  onSecondaryAction,
  secondaryActionIcon,
  accent = 'slate',
  compact = false,
  className = '',
  children,
}: EmptyStateProps) {
  const styles = accentConfig[accent] || accentConfig.slate

  const renderIcon = () => {
    if (!icon) return null
    if (React.isValidElement(icon)) return icon
    const IconComponent = icon as LucideIcon
    return <IconComponent className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
  }

  const ActionIcon = actionIcon ? (
    React.isValidElement(actionIcon) ? actionIcon : React.createElement(actionIcon as LucideIcon, { className: 'w-3.5 h-3.5' })
  ) : (
    <Plus className="w-3.5 h-3.5" />
  )

  const SecondaryIcon = secondaryActionIcon ? (
    React.isValidElement(secondaryActionIcon) ? secondaryActionIcon : React.createElement(secondaryActionIcon as LucideIcon, { className: 'w-3.5 h-3.5' })
  ) : null

  if (compact) {
    return (
      <div className={`p-6 rounded-[var(--radius-sm)] bg-[var(--surface-input)] border border-[var(--border-color)] text-center space-y-2.5 ${className}`}>
        {icon && (
          <div className={`w-8 h-8 rounded-[var(--radius-sm)] border ${styles.iconBorder} ${styles.iconBg} ${styles.iconColor} flex items-center justify-center mx-auto`}>
            {renderIcon()}
          </div>
        )}
        <div>
          {badge && <span className={`mono-badge ${styles.badge} text-[8px] mb-1 inline-block`}>{badge}</span>}
          <h4 className="text-xs font-bold text-content-primary tracking-tight font-mono">{title}</h4>
          {description && <p className="text-[11px] text-content-muted mt-0.5 max-w-xs mx-auto">{description}</p>}
        </div>
        {(actionText || children) && (
          <div className="pt-1 flex items-center justify-center gap-2">
            {actionText && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="btn-primary px-3 py-1 text-xs flex items-center gap-1.5"
              >
                {ActionIcon}
                <span>{actionText}</span>
              </button>
            )}
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative max-w-lg mx-auto text-center py-14 px-8 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--border-color)] border-l-[3px] ${styles.borderLeft} shadow-xl ${className}`}
    >
      {/* Icon Badge */}
      {icon && (
        <div
          className={`w-12 h-12 rounded-[var(--radius-sm)] border ${styles.iconBorder} ${styles.iconBg} ${styles.iconColor} flex items-center justify-center mx-auto mb-4 shadow-sm`}
        >
          {renderIcon()}
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-1.5 mb-6">
        {badge && (
          <div className="mb-2">
            <span className={`mono-badge ${styles.badge} text-[9px]`}>{badge}</span>
          </div>
        )}
        <h3 className="text-base font-bold text-content-primary tracking-tight font-mono uppercase">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-content-secondary max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      {(actionText || secondaryActionText || children) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          {secondaryActionText && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="btn-secondary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              {SecondaryIcon}
              <span>{secondaryActionText}</span>
            </button>
          )}

          {actionText && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="btn-primary px-4 py-1.5 text-xs flex items-center gap-1.5"
            >
              {ActionIcon}
              <span>{actionText}</span>
            </button>
          )}

          {children}
        </div>
      )}

      {/* Monospace subtle footer note */}
      <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-[10px] font-mono text-content-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]" />
        <span>NO ENTRIES IN CURRENT ARCHIVE VIEW</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-color)]" />
      </div>
    </div>
  )
}
