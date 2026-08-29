import { Grid3x3, List, LayoutGrid, Check } from 'lucide-react'
import { useUpdateLayoutMutation } from '../../../services/settingsService'
import { useSettings } from '../../../shared/hooks/useSettings'

export function LayoutSelector() {
  const { settings } = useSettings()
  const updateLayoutMutation = useUpdateLayoutMutation()

  const layouts = [
    { value: 'grid', label: 'Card Grid', icon: Grid3x3, description: 'Structured visual grid' },
    { value: 'list', label: 'Linear List', icon: List, description: 'Single line data overview' },
    { value: 'compact', label: 'Dense Matrix', icon: LayoutGrid, description: 'High density mosaic' },
  ] as const

  const sizes = [
    { value: 'small', label: 'Compact', description: 'Dense cards' },
    { value: 'medium', label: 'Standard', description: 'Balanced scale' },
    { value: 'large', label: 'Spacious', description: 'Prominent details' },
  ] as const

  const handleLayoutChange = (layout: typeof layouts[number]['value']) => {
    updateLayoutMutation.mutate({
      card_layout: layout,
      card_size: settings.card_size,
    })
  }

  const handleSizeChange = (size: typeof sizes[number]['value']) => {
    updateLayoutMutation.mutate({
      card_layout: settings.card_layout,
      card_size: size,
    })
  }

  return (
    <div className="space-y-6">
      {/* Layout Type */}
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-content-muted mb-2.5">Layout Structure</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {layouts.map((layout) => {
            const Icon = layout.icon
            const isActive = settings.card_layout === layout.value

            return (
              <button
                key={layout.value}
                onClick={() => handleLayoutChange(layout.value)}
                className={`
                  relative group flex flex-col items-start gap-2.5 p-3.5 rounded-[6px] transition-colors text-left cursor-pointer
                  ${isActive 
                    ? 'bg-[#15161a] border-2 border-accent-cyan' 
                    : 'bg-[#15161a] border border-[#2e323c] hover:border-[#424856]'
                  }
                `}
                disabled={updateLayoutMutation.isPending}
              >
                <div className={`
                  w-6 h-6 rounded-[3px] flex items-center justify-center
                  ${isActive ? 'bg-[#0f2e2b] text-accent-cyan border border-accent-cyan/40' : 'bg-[#121316] text-content-muted border border-[#2e323c]'}
                `}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-bold text-xs text-content-primary mb-0.5">
                    {layout.label}
                  </div>
                  <div className="text-[10px] font-mono text-content-muted">
                    {layout.description}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 rounded-[2px] bg-accent-cyan flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Card Size */}
      <div>
        <div className="text-[11px] font-mono font-bold uppercase text-content-muted mb-2.5">Card Scale</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {sizes.map((size) => {
            const isActive = settings.card_size === size.value

            return (
              <button
                key={size.value}
                onClick={() => handleSizeChange(size.value)}
                className={`
                  p-3 rounded-[4px] border transition-colors text-left cursor-pointer
                  ${isActive 
                    ? 'bg-[#1e2026] text-white border-accent-cyan font-bold' 
                    : 'bg-[#15161a] border-[#2e323c] text-content-secondary hover:border-[#424856]'
                  }
                `}
                disabled={updateLayoutMutation.isPending}
              >
                <div className="text-xs">{size.label}</div>
                <div className="text-[10px] font-mono text-content-muted">{size.description}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
