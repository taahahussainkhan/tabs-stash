import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'md',
  labelSize = 'sm',
  rounded,
  className = '',
  id,
  placeholder,
  ...props
}: Props) {
  const generatedId = useId()
  const inputId = id || generatedId

  const sizeClass = 
    size === 'xs' ? 'h-7 px-2 text-xs' : 
    size === 'sm' ? 'h-8 px-2.5 text-xs' : 
    size === 'md' ? 'h-9 px-3 text-xs' : 
    size === 'lg' ? 'h-11 px-4 text-sm' : 
    size === 'xl' ? 'h-13 px-5 text-base' : 
    'h-9 px-3 text-xs'
  
  const roundedClass = 
    rounded === 'none' ? 'rounded-none' :
    rounded === 'full' ? 'rounded-full' :
    'rounded-[4px]'
  
  const inputBaseClass = `input-modern w-full bg-[#15161a] border border-[#2e323c] focus:border-accent-vermillion text-content-primary transition-colors ${sizeClass} ${roundedClass} ${error ? 'border-danger/60 focus:border-danger' : ''} ${className}`

  const Label = () => label ? (
    <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`} htmlFor={inputId}>
      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">{label}</span>
    </label>
  ) : null

  const Error = () => error ? (
    <label className="label pt-1 px-0.5">
      <span className="text-[11px] font-mono text-danger">{error}</span>
    </label>
  ) : null

  const Helper = () => helperText && !error ? (
    <label className="label pt-1 px-0.5">
      <span className="text-[11px] font-mono text-content-muted">{helperText}</span>
    </label>
  ) : null

  return (
    <div className="form-control w-full group">
      <Label />
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 z-10 pointer-events-none text-content-muted group-focus-within:text-accent-vermillion transition-colors">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          placeholder={placeholder}
          className={`${inputBaseClass} ${leftIcon ? 'pl-8' : ''} ${rightIcon ? 'pr-8' : ''}`}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 z-10 text-content-muted group-focus-within:text-accent-vermillion transition-colors">
            {rightIcon}
          </span>
        )}
      </div>
      <Error />
      <Helper />
    </div>
  )
}
