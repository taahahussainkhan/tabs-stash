import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSettings {
  card_layout: 'grid' | 'list' | 'compact'
  cards_per_row?: number
  card_size: 'small' | 'medium' | 'large'
  dashboard_widgets?: Record<string, boolean>
  dashboard_order?: string[]
  theme: 'light' | 'dark' | 'auto'
  accent_color?: string
  font_size: 'small' | 'medium' | 'large' | 'xlarge'
  density: 'compact' | 'comfortable' | 'spacious'
  default_sort?: Record<string, string>
  default_filters?: Record<string, any>
  items_per_page: number
  date_format: string
  time_format: '12h' | '24h'
  max_concurrent_watching_movies?: number | null
  max_concurrent_watching_series?: number | null
}

interface SettingsStore {
  settings: UserSettings
  isLoaded: boolean
  setSettings: (settings: Partial<UserSettings>) => void
  updateLayout: (layout: Pick<UserSettings, 'card_layout' | 'card_size' | 'cards_per_row'>) => void
  updateDashboard: (dashboard: Pick<UserSettings, 'dashboard_widgets' | 'dashboard_order'>) => void
  resetSettings: () => void
}

const defaultSettings: UserSettings = {
  card_layout: 'grid',
  card_size: 'medium',
  theme: 'auto',
  font_size: 'medium',
  density: 'comfortable',
  items_per_page: 25,
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      isLoaded: false,

      setSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          isLoaded: true,
        })),

      updateLayout: (layout) =>
        set((state) => ({
          settings: { ...state.settings, ...layout },
        })),

      updateDashboard: (dashboard) =>
        set((state) => ({
          settings: { ...state.settings, ...dashboard },
        })),

      resetSettings: () =>
        set({
          settings: defaultSettings,
          isLoaded: true,
        }),
    }),
    {
      name: 'user-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
