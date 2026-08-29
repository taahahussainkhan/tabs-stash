import React from 'react'

export interface GhostTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string | null | undefined
  placeholder?: string
}

export function GhostTextArea({ value, placeholder, className = '', ...props }: GhostTextAreaProps) {
  const isEmpty = !value

  return (
    <textarea
      value={value ?? ''}
      className={`w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 px-0 py-1.5 text-xs sm:text-sm font-sans resize-none min-h-[60px] transition-colors ${
        isEmpty ? 'text-content-muted/40 italic' : 'text-content-primary'
      } ${className}`}
      placeholder={placeholder || 'Empty (add notes)...'}
      {...props}
    />
  )
}
