import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Calendar } from 'lucide-react'

interface DateTimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export const DateTimeInput = forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ label, error, helperText, size = 'md', labelSize = 'sm', className = '', ...props }, ref) => {
    const generatedId = useId()
    const inputId = props.id || generatedId

    const sizeClass = 
      size === 'xs' ? 'h-7 px-2 text-xs' : 
      size === 'sm' ? 'h-8 px-2.5 text-xs' : 
      size === 'md' ? 'h-9 px-3 text-xs' : 
      size === 'lg' ? 'h-11 px-4 text-sm' : 
      'h-9 px-3 text-xs'

    const inputBaseClass = `input-modern w-full font-mono bg-[#15161a] border border-[#2e323c] rounded-[4px] focus:border-accent-vermillion text-content-primary transition-colors ${sizeClass} ${error ? 'border-danger/60 focus:border-danger' : ''} ${className}`

    return (
      <div className="form-control w-full group">
        {label && (
          <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`} htmlFor={inputId}>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">{label}</span>
          </label>
        )}
        
        <div className="relative flex items-center">
          <Calendar className="absolute left-3 z-10 pointer-events-none text-content-muted w-3.5 h-3.5" />
          
          <input
            ref={ref}
            id={inputId}
            type="datetime-local"
            className={`${inputBaseClass} pl-8`}
            {...props}
          />
        </div>

        {error && (
          <label className="label pt-1 px-0.5">
            <span className="text-[11px] font-mono text-danger">{error}</span>
          </label>
        )}

        {helperText && !error && (
          <label className="label pt-1 px-0.5">
            <span className="text-[11px] font-mono text-content-muted">{helperText}</span>
          </label>
        )}
      </div>
    )
  }
)

DateTimeInput.displayName = 'DateTimeInput'
