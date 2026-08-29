import { useEffect } from 'react'
import { api } from '../app/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useSettingsStore, type UserSettings } from '../store/settingsStore'

// API Service
export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const response = await api.get('/user/settings')
    return response.data
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const response = await api.put('/user/settings', settings)
    return response.data
  },

  async updateLayout(layout: Pick<UserSettings, 'card_layout' | 'card_size' | 'cards_per_row'>): Promise<UserSettings> {
    const response = await api.patch('/user/settings/layout', null, { params: layout })
    return response.data
  },

  async updateDashboard(dashboard: Pick<UserSettings, 'dashboard_widgets' | 'dashboard_order'>): Promise<UserSettings> {
    const response = await api.patch('/user/settings/dashboard', dashboard)
    return response.data
  },
}

// Query Keys
export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
}

// React Query Hooks
export function useSettingsQuery() {
  const setSettings = useSettingsStore((state) => state.setSettings)

  const query = useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: settingsService.getSettings,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (query.data) {
      setSettings(query.data)
    }
  }, [query.data, setSettings])

  return query
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()
  const setSettings = useSettingsStore((state) => state.setSettings)

  return useMutation({
    mutationFn: settingsService.updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data)
      setSettings(data)
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update settings')
    },
  })
}

export function useUpdateLayoutMutation() {
  const queryClient = useQueryClient()
  const updateLayout = useSettingsStore((state) => state.updateLayout)

  return useMutation({
    mutationFn: settingsService.updateLayout,
    onMutate: async (newLayout) => {
      // Optimistic update
      updateLayout(newLayout)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update layout')
      // Refetch to revert optimistic update
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() })
    },
  })
}

export function useUpdateDashboardMutation() {
  const queryClient = useQueryClient()
  const updateDashboard = useSettingsStore((state) => state.updateDashboard)

  return useMutation({
    mutationFn: settingsService.updateDashboard,
    onMutate: async (newDashboard) => {
      // Optimistic update
      updateDashboard(newDashboard)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data)
      toast.success('Dashboard updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update dashboard')
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() })
    },
  })
}
