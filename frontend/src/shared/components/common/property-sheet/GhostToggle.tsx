import React from 'react'

export interface GhostToggleProps {
  value: boolean
  onChange: (val: boolean) => void
  label?: string
}

export function GhostToggle({ value, onChange, label }: GhostToggleProps) {
  return (
    <div className="flex items-center gap-2.5 group/toggle cursor-pointer select-none py-1" onClick={() => onChange(!value)}>
      <div className={`w-7 h-3.5 rounded-full relative transition-colors duration-150 ${
        value ? 'bg-accent-vermillion' : 'bg-[#2e323c]'
      }`}>
        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform duration-150 ${
          value ? 'translate-x-3.5' : 'translate-x-0'
        }`} />
      </div>
      {label && <span className="text-xs font-mono text-content-muted group-hover/toggle:text-content-primary transition-colors">{label}</span>}
    </div>
  )
}
