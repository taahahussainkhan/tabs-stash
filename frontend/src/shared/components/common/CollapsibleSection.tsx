import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CollapsibleSection({ title, children, defaultOpen = false, className = '' }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`collapse collapse-arrow bg-base-200 border border-base-300 ${className}`}>
      <input 
        type="checkbox" 
        checked={isOpen}
        onChange={() => setIsOpen(!isOpen)}
        className="peer"
      />
      <div className="collapse-title text-sm font-medium">
        {title}
      </div>
      <div className="collapse-content">
        {children}
      </div>
    </div>
  )
}
