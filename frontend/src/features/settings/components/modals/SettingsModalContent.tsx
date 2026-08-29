import { Layout, Check, X } from 'lucide-react'
import { LayoutSelector } from '../LayoutSelector'

interface SettingsModalContentProps {
  onClose: () => void
}

export function SettingsModalContent({ onClose }: SettingsModalContentProps) {
  return (
    <div className="flex flex-col h-full bg-[#1e2026]">
      <div className="p-6 sm:p-10 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 font-mono">
            <span className="mono-badge mono-badge-vermillion text-[9px]">SYSTEM</span>
            <span className="text-[10px] text-content-muted uppercase tracking-wider">Preferences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">
            Vault Configuration
          </h2>
          <p className="text-xs text-content-secondary">
            Customize layout, view densities, and visual behavior across your chronicles.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-content-muted/40 mb-2 px-1">
            Display &amp; Layout
          </div>
          <LayoutSelector />
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 sm:px-10 py-4 border-t border-[#2e323c] flex items-center justify-end bg-[#17181d] shrink-0">
        <button 
          type="button"
          className="btn-primary px-5 py-2 text-xs flex items-center gap-1.5"
          onClick={onClose}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  )
}
