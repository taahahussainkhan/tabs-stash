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
              relative group flex flex-col items-start gap-2.5 p-4 rounded-[6px] transition-colors text-left cursor-pointer
              ${isActive 
                ? 'bg-[#15161a] border-2 border-accent-vermillion shadow-sm' 
                : 'bg-[#15161a] border border-[#2e323c] hover:border-[#424856]'
              }
            `}
          >
            <div className={`
              w-7 h-7 rounded-[4px] flex items-center justify-center
              ${isActive ? 'bg-[#271414] text-accent-vermillion border border-accent-vermillion/40' : 'bg-[#121316] text-content-muted border border-[#2e323c]'}
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
