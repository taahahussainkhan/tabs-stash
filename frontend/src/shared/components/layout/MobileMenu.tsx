import { Link } from 'react-router-dom'
import { MOBILE_NAV_LINKS } from '../../constants/navigation'

export function MobileMenu() {
  return (
    <div className="dropdown dropdown-end lg:hidden">
      <div 
        tabIndex={0} 
        role="button" 
        className="p-2 rounded-[4px] bg-[#1e2026] border border-[#2e323c] hover:bg-[#262830] text-content-secondary hover:text-white transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
      <div
        tabIndex={0}
        className="dropdown-content z-50 p-3 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl w-64 mt-2"
      >
        {MOBILE_NAV_LINKS.map((section, index) => (
          <div key={section.label} className={index > 0 ? 'mt-3 pt-3 border-t border-[#2e323c]' : ''}>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-content-muted mb-1.5 px-2">
              {section.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {section.links.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-content-secondary hover:text-white hover:bg-[#262830] transition-colors"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-accent-vermillion" />}
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
