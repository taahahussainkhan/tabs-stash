import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: Props) {
  const variantClasses = {
    primary: 'bg-[#e05a47] hover:bg-[#cc4a38] text-white border-[#ff7b68]',
    secondary: 'bg-[#1e2026] hover:bg-[#262830] text-content-secondary hover:text-white border-[#2e323c] hover:border-content-muted',
    accent: 'bg-[#1e2026] hover:bg-[#262830] text-accent-ochre border-accent-ochre/30 hover:border-accent-ochre',
    ghost: 'bg-transparent hover:bg-[#1e2026] text-content-secondary hover:text-white border-transparent',
    outline: 'bg-transparent hover:bg-[#1e2026] text-content-secondary hover:text-white border-[#2e323c] hover:border-content-muted',
    danger: 'bg-[#271414] hover:bg-[#3b1818] text-danger border-danger/40 hover:border-danger'
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-[11px] h-7 gap-1.5',
    sm: 'px-3 py-1.5 text-xs h-8 gap-2',
    md: 'px-4 py-2 text-xs h-9 gap-2',
    lg: 'px-5 py-2.5 text-sm h-11 gap-2.5'
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-bold tracking-tight rounded-[4px] border transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
        variantClasses[variant],
        sizeClasses[size],
        loading && 'opacity-80 pointer-events-none',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
