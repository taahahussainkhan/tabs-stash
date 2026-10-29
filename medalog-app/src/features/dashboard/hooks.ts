import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from './api';
import type { DashboardData } from './types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: dashboardKeys.overview(),
    queryFn: dashboardApi.overview,
    staleTime: 60_000,
  });
}
