import { ArrowLeft, Layout, Settings, Palette, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LayoutSelector } from './components/LayoutSelector'
import { WatchingLimitsSelector } from './components/WatchingLimitsSelector'
import { ThemeSelector } from './components/ThemeSelector'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 page-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-[#2e323c]">
        <button
          className="w-8 h-8 rounded-[4px] flex items-center justify-center bg-[#1e2026] border border-[#2e323c] hover:bg-[#262830] text-content-secondary hover:text-white transition-colors"
          onClick={() => navigate(-1)}
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5 font-mono">
            <span className="mono-badge mono-badge-ochre">PREFERENCES</span>
            <span className="text-[11px] text-content-muted uppercase tracking-wider">System Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-content-primary tracking-tight">Configuration & Preferences</h1>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Status Overview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#1e2026] p-4 rounded-[6px] border border-[#2e323c] space-y-3 font-mono">
            <div className="flex items-center gap-2 text-xs font-bold text-content-primary pb-2 border-b border-[#242730]">
              <Settings className="w-3.5 h-3.5 text-accent-vermillion" />
              <span>SYSTEM STATUS</span>
            </div>
            
            <div className="space-y-2">
              <div className="p-2.5 bg-[#15161a] border border-[#2e323c] rounded-[4px] flex items-center justify-between">
                <span className="text-xs text-content-muted">Theme Mode</span>
                <span className="mono-badge mono-badge-ochre text-[9px]">ACTIVE</span>
              </div>
              <div className="p-2.5 bg-[#15161a] border border-[#2e323c] rounded-[4px] flex items-center justify-between">
                <span className="text-xs text-content-muted">Storage Engine</span>
                <span className="mono-badge mono-badge-sage text-[9px]">ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Setting Panels */}
        <div className="lg:col-span-8 space-y-6">
          {/* Theme Section */}
          <section className="bg-[#1e2026] p-5 rounded-[6px] border border-[#2e323c] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#242730]">
              <Palette className="w-4 h-4 text-accent-vermillion" />
              <div>
                <h3 className="text-sm font-bold text-content-primary">Theme & Appearance</h3>
                <p className="text-[11px] font-mono text-content-muted">Select light or dark editorial canvas</p>
              </div>
            </div>
            <ThemeSelector />
          </section>

          {/* Layout Section */}
          <section className="bg-[#1e2026] p-5 rounded-[6px] border border-[#2e323c] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#242730]">
              <Layout className="w-4 h-4 text-accent-cyan" />
              <div>
                <h3 className="text-sm font-bold text-content-primary">Layout & Display</h3>
                <p className="text-[11px] font-mono text-content-muted">Choose card proportions and grid densities</p>
              </div>
            </div>
            <LayoutSelector />
          </section>

          {/* Limits Section */}
          <section className="bg-[#1e2026] p-5 rounded-[6px] border border-[#2e323c] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#242730]">
              <Eye className="w-4 h-4 text-accent-ochre" />
              <div>
                <h3 className="text-sm font-bold text-content-primary">Activity & Limits</h3>
                <p className="text-[11px] font-mono text-content-muted">Configure active in-progress ceilings</p>
              </div>
            </div>
            <WatchingLimitsSelector />
          </section>
        </div>
      </div>
    </div>
  )
}
