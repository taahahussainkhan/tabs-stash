import { X, Layout } from 'lucide-react'
import { LayoutSelector } from './LayoutSelector'

interface SettingsModalProps {
  onClose: () => void
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold">Display Settings</h2>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Layout Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-lg sm:text-xl font-semibold">Layout & Display</h3>
            </div>
            <LayoutSelector />
          </div>

          {/* Future: Dashboard Settings */}
          {/* <div>
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Dashboard</h3>
            </div>
            <DashboardCustomizer />
          </div> */}
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  )
}
