import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from './api';
import type { CardDraft, CardItem } from './types';

/** Cards have their own cache namespace: both Tabs and Capture read it. */
export const cardsKeys = {
  all: ['cards'] as const,
  list: () => [...cardsKeys.all, 'list'] as const,
};

export function useCards() {
  return useQuery<CardItem[]>({
    queryKey: cardsKeys.list(),
    queryFn: cardsApi.list,
    staleTime: 60_000,
  });
}

/** Create a card, then show it everywhere without a manual refresh. */
export function useCreateCard() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (draft: CardDraft) => cardsApi.create(draft),
    onSettled: () => client.invalidateQueries({ queryKey: cardsKeys.list() }),
  });
}

/** Flip pin state optimistically - pinning must feel instant. */
export function useToggleCardPin() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      cardsApi.setPinned(id, isPinned),
    onMutate: async ({ id, isPinned }) => {
      await client.cancelQueries({ queryKey: cardsKeys.list() });
      const previous = client.getQueryData<CardItem[]>(cardsKeys.list());
      client.setQueryData<CardItem[]>(cardsKeys.list(), old =>
        (old ?? []).map(card => (card.id === id ? { ...card, isPinned } : card))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(cardsKeys.list(), context.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: cardsKeys.list() }),
  });
}

export function useDeleteCard() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cardsApi.remove(id),
    onSettled: () => client.invalidateQueries({ queryKey: cardsKeys.list() }),
  });
}
