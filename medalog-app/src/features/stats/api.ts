import { api } from '../../core/http';
import type { StatsSnapshot } from './types';

/**
 * `GET /stats` answers from the denormalised counters document, so this stays
 * cheap no matter how large the library gets.
 */
export const statsApi = {
  get: () => api.get<StatsSnapshot>('/stats'),
};
