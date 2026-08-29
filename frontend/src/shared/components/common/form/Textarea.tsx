import { useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  labelSize?: 'sm' | 'md'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Textarea({
  label,
  error,
  helperText,
  size = 'md',
  labelSize = 'sm',
  className = '',
  id,
  ...props
}: Props) {
  const generatedId = useId()
  const textareaId = id || generatedId

  const sizeClass = 
    size === 'xs' ? 'p-2 text-xs' : 
    size === 'sm' ? 'p-2.5 text-xs' : 
    size === 'md' ? 'p-3 text-xs' : 
    size === 'lg' ? 'p-4 text-sm' : 
    size === 'xl' ? 'p-5 text-base' : 
    'p-3 text-xs'
  
  const textareaBaseClass = `textarea-modern w-full min-h-[100px] bg-[#15161a] border border-[#2e323c] rounded-[4px] focus:border-accent-vermillion text-content-primary transition-colors ${sizeClass} ${error ? 'border-danger/60 focus:border-danger' : ''} ${className}`

  const Label = () => label ? (
    <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`} htmlFor={textareaId}>
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
      <textarea
        id={textareaId}
        className={textareaBaseClass}
        {...props}
      />
      <Error />
      <Helper />
    </div>
  )
}
