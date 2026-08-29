import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { settingsApi } from './api'
import { useAuth } from './auth'

export type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = window.localStorage.getItem('theme') as Theme
    return saved || 'dark'
  })

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    window.localStorage.setItem('theme', theme)
  }, [theme])

  // Fetch settings when user logs in
  useEffect(() => {
    if (user) {
      settingsApi.getSettings()
        .then(response => {
          if (response.data.theme && (response.data.theme === 'dark' || response.data.theme === 'light')) {
            setThemeState(response.data.theme)
          }
        })
        .catch(err => console.error('Failed to fetch theme settings:', err))
    }
  }, [user])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    if (user) {
      try {
        await settingsApi.updateSettings({ theme: newTheme })
      } catch (err) {
        console.error('Failed to save theme setting:', err)
      }
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
