import React from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

export interface GhostSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: string | number | null | undefined
  options: SelectOption[]
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  className?: string
}

export function GhostSelect({ value, options, onChange, placeholder = 'Select...', className = '', ...props }: GhostSelectProps) {
  const isEmpty = value === undefined || value === null || value === ''
  const selectedOption = options.find((o) => String(o.value) === String(value))

  return (
    <div className={`relative group/select w-full ${className}`}>
      <select
        value={value ?? ''}
        onChange={onChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value} className="bg-[#1e2026] text-content-primary">
            {o.label}
          </option>
        ))}
      </select>
      <div className={`flex items-center justify-between py-1.5 text-xs sm:text-sm font-mono transition-colors ${
        isEmpty ? 'text-content-muted/40 italic' : 'text-content-primary'
      }`}>
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover/select:opacity-100 transition-opacity shrink-0 ml-1.5" />
      </div>
    </div>
  )
}
