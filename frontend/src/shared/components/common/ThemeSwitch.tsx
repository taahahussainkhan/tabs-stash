import { useTheme } from '../../../app/theme'
import { Sun, Moon } from 'lucide-react'

export function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-mono font-bold text-content-muted uppercase tracking-wider">
        Theme Interface
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => theme === 'dark' && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border transition-colors ${
            theme === 'light'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'bg-[var(--surface)] text-content-secondary border-[var(--border-color)] hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          Light
        </button>

        <button
          type="button"
          onClick={() => theme === 'light' && toggleTheme()}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold border transition-colors ${
            theme === 'dark'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'bg-[var(--surface)] text-content-secondary border-[var(--border-color)] hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          Dark (Obsidian)
        </button>
      </div>
      <p className="text-[11px] font-mono text-content-muted">
        Select aesthetic display style for your personal logs.
      </p>
    </div>
  )
}
