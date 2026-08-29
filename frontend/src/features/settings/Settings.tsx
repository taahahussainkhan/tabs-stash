import { ArrowLeft, Layout, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LayoutSelector } from './components/LayoutSelector'
import { WatchingLimitsSelector } from './components/WatchingLimitsSelector'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="w-full min-h-screen bg-base-200/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-base-content/60">Customize your experience</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Layout & Display */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Layout & Display</h2>
              </div>
              <LayoutSelector />
            </div>
          </div>

          {/* Watching Limits */}
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-success" />
                <h2 className="text-xl font-semibold">Watching Limits</h2>
              </div>
              <WatchingLimitsSelector />
            </div>
          </div>

          {/* Future sections can be added here */}
        </div>
      </div>
    </div>
  )
}
