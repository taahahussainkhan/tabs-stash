import { api } from '../../core/http';
import type { SavedLink, StashedSession } from './types';

/**
 * Read-only Tab Stash API plus the one mutation mobile owns (reading state).
 * Cards live in the cards module, not here.
 */
export const tabsApi = {
  sessions: (limit = 100) =>
    api.get<StashedSession[]>('/sync/sessions', { query: { limit, skip: 0 } }),

  links: () => api.get<SavedLink[]>('/sync/links'),

  setLinkRead: (id: string, isRead: boolean) =>
    api.patch<SavedLink>(`/sync/links/${id}`, { isRead }),
};
