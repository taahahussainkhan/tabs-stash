import { useLocation } from 'react-router-dom'
import { WifiOff } from 'lucide-react'
import { ProfileMenu } from '../common/ProfileMenu'
import { Dropdown } from '../common/form/Dropdown'
import { Logo } from './Logo'
import { MobileMenu } from './MobileMenu'
import { GlobalSearch } from './GlobalSearch'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { NAV_DROPDOWNS } from '../../constants/navigation'

export function Navbar() {
  const location = useLocation()
  const isOnline = useOnlineStatus()

  return (
    <header className="sticky top-0 z-50 bg-[#17181d]/95 backdrop-blur-md border-b border-[#2e323c] px-4 sm:px-8 py-3 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Logo />

          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-danger/10 border border-danger/30 rounded-[3px] text-danger animate-pulse">
              <WifiOff className="w-3 h-3" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Offline</span>
            </div>
          )}
        </div>

        {/* Center: Search & Navigation */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl justify-center">
          <div className="w-full max-w-xs">
            <GlobalSearch />
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_DROPDOWNS.map((dropdown) => {
              const Icon = dropdown.icon
              const isActive = location.pathname.startsWith(dropdown.basePath)

              return (
                <Dropdown
                  key={dropdown.id}
                  mode="navigation"
                  items={dropdown.links}
                  placeholder={dropdown.label}
                  basePath={dropdown.basePath}
                  buttonClassName={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-semibold tracking-tight transition-all duration-150 border ${
                    isActive
                      ? 'bg-[#1e2026] text-white border-[#2e323c] border-b-2 border-b-[#e05a47]'
                      : 'text-content-secondary hover:text-content-primary hover:bg-[#1e2026] border-transparent hover:border-[#2e323c]'
                  }`}
                  triggerIcon={
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e05a47]' : 'text-content-muted'}`} />
                  }
                  hover
                  className="m-0"
                />
              )
            })}
          </div>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          <ProfileMenu />
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
