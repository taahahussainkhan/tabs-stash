import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Shared cache for every feature.
 *
 * Screens never fetch by hand: they read through useQuery keyed by feature
 * keys, and mutations invalidate those keys. Coming back to the foreground
 * re-runs stale queries, which is what makes phone + web feel live.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error: any) => {
        // auth / validation errors are not worth retrying
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
