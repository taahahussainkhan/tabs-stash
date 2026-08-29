import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost'
  | 'outline'

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  outline?: boolean
  onRemove?: () => void
  className?: string
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  onRemove,
  className = ''
}: BadgeProps) {
  const variantClasses: Record<BadgeVariant, string> = {
    primary: 'mono-badge-vermillion',
    secondary: 'mono-badge-neutral',
    accent: 'mono-badge-ochre',
    neutral: 'mono-badge-neutral',
    info: 'mono-badge-cyan',
    success: 'mono-badge-sage',
    warning: 'mono-badge-ochre',
    error: 'mono-badge-danger',
    ghost: 'bg-transparent text-content-muted border border-transparent',
    outline: 'bg-transparent text-content-secondary border border-[#2e323c]'
  }

  const sizeClasses: Record<BadgeSize, string> = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1'
  }

  return (
    <span className={`mono-badge ${variantClasses[variant] || 'mono-badge-neutral'} ${sizeClasses[size]} ${className}`}>
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="hover:text-danger hover:opacity-100 opacity-70 transition-opacity flex items-center justify-center ml-1"
          aria-label="Remove"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  )
}
