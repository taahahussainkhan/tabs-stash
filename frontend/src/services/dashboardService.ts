import { api } from '../app/api'
import type { DashboardData, MovieSummary } from '../features/home/types/dashboard'
import { useQuery } from '@tanstack/react-query'

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<any>('/dashboard')
    const rawData = response.data?.data || response.data || {}
    
    const mapSummary = (s: any): MovieSummary => ({
      ...s,
      id: s.public_id || s.id || s._id,
    })

    return {
      stats: rawData.stats || { total_movies: 0, total_series: 0, total_books: 0, watchlist: 0 },
      continue_watching: Array.isArray(rawData.continue_watching) ? rawData.continue_watching.map(mapSummary) : [],
      recently_completed: Array.isArray(rawData.recently_completed) ? rawData.recently_completed.map(mapSummary) : [],
      watchlist_preview: Array.isArray(rawData.watchlist_preview) ? rawData.watchlist_preview.map(mapSummary) : [],
    }
  },
}

export const dashboardKeys = {
  all: ['dashboard'] as const,
  data: () => [...dashboardKeys.all, 'data'] as const,
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.data(),
    queryFn: () => dashboardService.getDashboardData(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}
