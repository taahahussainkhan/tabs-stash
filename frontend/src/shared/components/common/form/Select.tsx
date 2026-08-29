import { useId } from 'react'
import type { SelectHTMLAttributes } from 'react'

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  options: { value: string; label: string }[]
}

export function Select({
  label,
  error,
  helperText,
  placeholder,
  size = 'md',
  labelSize = 'sm',
  options,
  className = '',
  id,
  ...props
}: Props) {
  const generatedId = useId()
  const selectId = id || generatedId

  const sizeClass = 
    size === 'xs' ? 'h-7 px-2 text-xs' : 
    size === 'sm' ? 'h-8 px-2.5 text-xs' : 
    size === 'md' ? 'h-9 px-3 text-xs' : 
    size === 'lg' ? 'h-11 px-4 text-sm' : 
    size === 'xl' ? 'h-13 px-5 text-base' : 
    'h-9 px-3 text-xs'
  
  const selectBaseClass = `select-modern w-full bg-[#15161a] border border-[#2e323c] rounded-[4px] focus:border-accent-vermillion text-content-primary transition-colors ${sizeClass} ${error ? 'border-danger/60 focus:border-danger' : ''} ${className}`

  const Label = () => label ? (
    <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`} htmlFor={selectId}>
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
      <select
        id={selectId}
        className={selectBaseClass}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-[#1e2026] text-content-muted">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1e2026] text-content-primary">
            {option.label}
          </option>
        ))}
      </select>
      <Error />
      <Helper />
    </div>
  )
}
