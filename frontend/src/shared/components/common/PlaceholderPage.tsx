import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 page-fade-in">
      <div className="text-center max-w-md bg-[#1e2026] border border-[#2e323c] p-8 rounded-[6px]">
        <div className="mb-4 flex justify-center text-accent-vermillion">
          {icon || <Construction className="w-10 h-10" />}
        </div>
        <h1 className="text-xl font-bold text-content-primary mb-2">{title}</h1>
        {description && (
          <p className="text-xs text-content-secondary mb-4 leading-relaxed font-mono">{description}</p>
        )}
        <span className="mono-badge mono-badge-ochre text-[10px]">
          <Construction className="w-3 h-3" />
          <span>IN DEVELOPMENT</span>
        </span>
      </div>
    </div>
  )
}
