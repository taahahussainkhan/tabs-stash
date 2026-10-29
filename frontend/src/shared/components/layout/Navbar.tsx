import { Link, useLocation } from 'react-router-dom'
import { Home, WifiOff } from 'lucide-react'
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
  const isHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-50 border-b border-border-main bg-[var(--surface-sidebar)]/95 px-4 py-3 backdrop-blur-md transition-all duration-200 sm:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <Logo />

          {!isOnline && (
            <div className="flex animate-pulse items-center gap-1.5 rounded-[var(--radius-pill)] border border-danger/30 bg-danger/10 px-2.5 py-1 text-danger">
              <WifiOff className="h-3 w-3" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Offline</span>
            </div>
          )}
        </div>

        {/* Center: Search & Navigation */}
        <div className="flex max-w-2xl flex-1 items-center justify-center gap-3">
          <div className="w-full max-w-xs">
            <GlobalSearch />
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              to="/"
              className={
                isHome
                  ? 'flex items-center gap-2 rounded-[var(--radius-pill)] border border-transparent bg-primary-soft px-3 py-1.5 text-xs font-semibold text-content-primary'
                  : 'flex items-center gap-2 rounded-[var(--radius-pill)] border border-transparent px-3 py-1.5 text-xs font-semibold text-content-secondary transition-all duration-150 hover:bg-surface hover:text-content-primary'
              }
            >
              <Home className={`h-3.5 w-3.5 ${isHome ? 'text-primary' : 'text-content-muted'}`} />
              <span>Home</span>
            </Link>

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
                  buttonClassName={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-pill)] text-xs font-semibold tracking-tight transition-all duration-150 border ${
                    isActive
                      ? 'bg-primary-soft text-content-primary border-transparent'
                      : 'text-content-secondary hover:text-content-primary hover:bg-surface border-transparent'
                  }`}
                  triggerIcon={
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-content-muted'}`} />
                  }
                  hover
                  className="m-0"
                />
              )
            })}
          </nav>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex shrink-0 items-center gap-2">
          <ProfileMenu />
          <div className="lg:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
