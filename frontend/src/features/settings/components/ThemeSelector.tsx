import { Sun, Moon, Check } from 'lucide-react'
import { useTheme } from '../../../app/theme'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Light Mode', icon: Sun, description: 'Crisp paper with sharp dark borders' },
    { value: 'dark', label: 'Dark Obsidian', icon: Moon, description: 'Solid dark workspace with vermillion accents' },
  ] as const

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {themes.map((t) => {
        const Icon = t.icon
        const isActive = theme === t.value

        return (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`
              relative group flex flex-col items-start gap-2.5 p-4 rounded-[var(--radius-md)] transition-colors text-left cursor-pointer
              ${isActive 
                ? 'bg-[var(--surface-input)] border-2 border-accent-vermillion shadow-sm' 
                : 'bg-[var(--surface-input)] border border-[var(--border-color)] hover:border-[#424856]'
              }
            `}
          >
            <div className={`
              w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center
              ${isActive ? 'bg-[var(--danger-soft)] text-accent-vermillion border border-accent-vermillion/40' : 'bg-[var(--background)] text-content-muted border border-[var(--border-color)]'}
            `}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-xs text-content-primary mb-0.5">
                {t.label}
              </div>
              <div className="text-[11px] font-mono text-content-muted">
                {t.description}
              </div>
            </div>
            {isActive && (
              <div className="absolute top-3 right-3 w-4 h-4 rounded-[2px] bg-accent-vermillion flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
