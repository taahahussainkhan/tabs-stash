import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Plus, Minus } from 'lucide-react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showControls?: boolean
}

export function NumberInput({
  label,
  error,
  helperText,
  size = 'md',
  labelSize = 'sm',
  showControls = true,
  className = '',
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  ...props
}: Props) {
  const generatedId = useId()
  const inputId = id || generatedId

  const sizeClass = 
    size === 'xs' ? 'h-7 px-2 text-xs' : 
    size === 'sm' ? 'h-8 px-2.5 text-xs' : 
    size === 'md' ? 'h-9 px-3 text-xs' : 
    size === 'lg' ? 'h-11 px-4 text-sm' : 
    'h-9 px-3 text-xs'

  const inputBaseClass = `input-modern w-full font-mono text-center bg-[#15161a] border border-[#2e323c] rounded-[4px] focus:border-accent-vermillion text-content-primary transition-colors ${sizeClass} ${error ? 'border-danger/60 focus:border-danger' : ''} ${className}`

  const handleIncrement = () => {
    const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0
    const newValue = currentValue + (step as number)
    if (max !== undefined && newValue > (max as number)) return
    onChange?.({ target: { value: newValue.toString() } } as any)
  }

  const handleDecrement = () => {
    const currentValue = typeof value === 'number' ? value : parseFloat(value as string) || 0
    const newValue = currentValue - (step as number)
    if (min !== undefined && newValue < (min as number)) return
    onChange?.({ target: { value: newValue.toString() } } as any)
  }

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
        {showControls && (
          <button
            type="button"
            onClick={handleDecrement}
            className="absolute left-1.5 z-20 w-6 h-6 flex items-center justify-center rounded-[3px] bg-[#1e2026] hover:bg-[#262830] text-content-muted hover:text-content-primary border border-[#2e323c] transition-colors"
            aria-label="Decrease value"
          >
            <Minus className="w-3 h-3" />
          </button>
        )}

        <input
          id={inputId}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          className={`${inputBaseClass} ${showControls ? 'px-8' : ''}`}
          {...props}
        />

        {showControls && (
          <button
            type="button"
            onClick={handleIncrement}
            className="absolute right-1.5 z-20 w-6 h-6 flex items-center justify-center rounded-[3px] bg-[#1e2026] hover:bg-[#262830] text-content-muted hover:text-content-primary border border-[#2e323c] transition-colors"
            aria-label="Increase value"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
      <Error />
      <Helper />
    </div>
  )
}
