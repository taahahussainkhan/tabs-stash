import React from 'react'

export interface GhostInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number | null | undefined
  placeholder?: string
}

export function GhostInput({ value, placeholder, className = '', ...props }: GhostInputProps) {
  const isEmpty = value === undefined || value === null || value === ''

  return (
    <input
      value={value ?? ''}
      className={`w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-0 py-1.5 text-xs sm:text-sm font-mono transition-colors ${
        isEmpty ? 'text-content-muted/40 italic' : 'text-content-primary'
      } ${className}`}
      placeholder={placeholder || 'Empty'}
      {...props}
    />
  )
}
