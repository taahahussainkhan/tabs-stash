import { useQuery } from '@tanstack/react-query';
import { statsApi } from './api';
import type { StatsSnapshot } from './types';

/**
 * Counters change only when the user writes something, so a long stale time is
 * correct - and every capture mutation already invalidates this key.
 */
export const statsKeys = {
  all: ['stats'] as const,
  snapshot: () => [...statsKeys.all, 'snapshot'] as const,
};

export function useStats() {
  return useQuery<StatsSnapshot>({
    queryKey: statsKeys.snapshot(),
    queryFn: statsApi.get,
    staleTime: 5 * 60_000,
  });
}
