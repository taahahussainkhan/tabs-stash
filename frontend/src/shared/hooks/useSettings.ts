import { useSettingsStore } from '../../store/settingsStore'
import { useSettingsQuery } from '../../services/settingsService'

/**
 * Hook to access user settings with automatic loading from API
 */
export function useSettings() {
  const { settings, isLoaded } = useSettingsStore()
  const { isLoading, error } = useSettingsQuery()

  return {
    settings,
    isLoading: !isLoaded || isLoading,
    error,
  }
}
