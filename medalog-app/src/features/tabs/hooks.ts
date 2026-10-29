import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { tabsApi } from './api';
import type { SavedLink, StashedSession } from './types';

/** Cache keys for this feature. Everything else invalidates through here. */
export const tabsKeys = {
  all: ['tabs'] as const,
  sessions: () => [...tabsKeys.all, 'sessions'] as const,
  links: () => [...tabsKeys.all, 'links'] as const,
};

export function useSessions() {
  return useQuery<StashedSession[]>({
    queryKey: tabsKeys.sessions(),
    queryFn: () => tabsApi.sessions(),
    staleTime: 60_000,
  });
}

export function useSavedLinks() {
  return useQuery<SavedLink[]>({
    queryKey: tabsKeys.links(),
    queryFn: () => tabsApi.links(),
    staleTime: 60_000,
  });
}

/** Flip the read flag optimistically - the shelf should feel instant. */
export function useToggleLinkRead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => tabsApi.setLinkRead(id, isRead),
    onMutate: async ({ id, isRead }) => {
      await client.cancelQueries({ queryKey: tabsKeys.links() });
      const previous = client.getQueryData<SavedLink[]>(tabsKeys.links());
      client.setQueryData<SavedLink[]>(tabsKeys.links(), old =>
        (old ?? []).map(link =>
          link.id === id ? { ...link, isRead, readAt: isRead ? Date.now() : null } : link
        )
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(tabsKeys.links(), context.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: tabsKeys.links() }),
  });
}

