import React from 'react'

export interface PropertyRowProps {
  icon?: React.ReactNode
  label: string
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function PropertyRow({ icon, label, children, required, className = '' }: PropertyRowProps) {
  return (
    <div className={`flex items-center group/row min-h-[38px] hover:bg-white/[0.02] -mx-3 px-3 rounded-[4px] transition-colors ${className}`}>
      <div className="flex items-center gap-2.5 w-[130px] sm:w-[170px] shrink-0 text-content-muted">
        {icon && <span className="opacity-60 group-hover/row:opacity-100 transition-opacity shrink-0">{icon}</span>}
        <span className="text-xs font-mono font-medium truncate">
          {label}
          {required && <span className="text-accent-vermillion ml-1">*</span>}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
