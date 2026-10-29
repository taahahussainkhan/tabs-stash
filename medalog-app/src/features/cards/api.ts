import { api } from '../../core/http';
import type { CardDraft, CardItem } from './types';

/** All card mutations the app owns. Reads and writes hit the same resource. */
export const cardsApi = {
  list: () => api.get<CardItem[]>('/cards'),

  create: (draft: CardDraft) =>
    api.post<CardItem>('/cards', {
      title: draft.title,
      content: draft.content,
      color: draft.color,
      tags: draft.tags ?? [],
    }),

  setPinned: (id: string, isPinned: boolean) =>
    api.patch<{ isPinned: boolean }>(`/cards/${id}/pin`, { isPinned }),

  remove: (id: string) => api.delete(`/cards/${id}`),
};
