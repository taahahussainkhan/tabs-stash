import { api } from '../app/api'
import type { DashboardData, MovieSummary } from '../features/home/types/dashboard'

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<any>('/dashboard')
    
    const mapSummary = (s: any): MovieSummary => ({
      ...s,
      id: s.public_id // Map public_id to id
    })

    return {
      ...response.data,
      continue_watching: response.data.continue_watching.map(mapSummary),
      recently_completed: response.data.recently_completed.map(mapSummary),
      watchlist_preview: response.data.watchlist_preview.map(mapSummary)
    }
  },
}

// React Query hooks
import { useQuery } from '@tanstack/react-query'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })
}
