import { useId } from 'react'

interface Props {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  labelSize?: 'sm' | 'md'
  disabled?: boolean
}

export function RatingSlider({ 
  label,
  value,
  onChange,
  min = 0,
  max = 10,
  step = 0.5,
  showValue = true,
  labelSize = 'sm',
  disabled = false
}: Props) {
  const generatedId = useId()
  const sliderId = generatedId

  return (
    <div className="form-control w-full group">
      {label && (
        <label className={`label ${labelSize === 'sm' ? 'py-1' : 'pb-1.5'} px-0.5`} htmlFor={sliderId}>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-content-muted">{label}</span>
        </label>
      )}
      
      <div className="flex items-center gap-3 py-1.5">
        <input
          id={sliderId}
          type="range"
          className="range range-xs flex-1 accent-[var(--primary)] cursor-pointer"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          disabled={disabled}
        />
        
        {showValue && (
          <div className="flex items-center justify-center px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-input)] border border-[var(--border-color)] min-w-[3rem]">
            <span className="font-mono font-bold text-xs text-accent-ochre">{value.toFixed(1)}</span>
            <span className="font-mono text-[10px] text-content-muted ml-0.5">/10</span>
          </div>
        )}
      </div>
    </div>
  )
}
