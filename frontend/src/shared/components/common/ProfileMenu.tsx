import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/auth'
import { User, Settings, LogOut } from 'lucide-react'

export function ProfileMenu() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U'

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        className="w-8 h-8 rounded-[4px] bg-[#1e2026] border border-[#2e323c] flex items-center justify-center hover:border-accent-vermillion text-content-primary font-bold text-xs cursor-pointer transition-colors select-none"
      >
        <span>{initial}</span>
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-50 p-2 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl w-52 mt-2"
      >
        <div className="px-3 py-2 border-b border-[#2e323c] mb-1">
          <p className="text-[10px] font-mono font-bold text-content-muted uppercase tracking-wider">Account</p>
          <p className="text-xs font-bold text-content-primary truncate mt-0.5">{user?.username || 'User'}</p>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-content-secondary hover:text-white hover:bg-[#262830] rounded-[4px] transition-colors text-left"
          >
            <User className="w-3.5 h-3.5 text-accent-cyan" />
            View Profile
          </button>
          
          <button
            onClick={() => navigate('/settings')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-content-secondary hover:text-white hover:bg-[#262830] rounded-[4px] transition-colors text-left"
          >
            <Settings className="w-3.5 h-3.5 text-accent-ochre" />
            Settings
          </button>
        </div>

        <div className="h-[1px] bg-[#2e323c] my-1" />

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-danger hover:bg-[#271414] rounded-[4px] transition-colors text-left"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log out
        </button>
      </div>
    </div>
  )
}
