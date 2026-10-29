import { api } from '../../core/http';
import { getSession } from '../../core/session';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
  };
  stats?: {
    sessions: number;
    tabs: number;
  };
}

const DEVICE = 'MediaLog Mobile';

/** Auth endpoints. Everything here is unauthenticated except `me`. */
export const authApi = {
  login: (email: string, password: string) =>
    api.post<Tokens>('/auth/login', { email, password, deviceName: DEVICE }, { auth: false }),

  register: (name: string, email: string, password: string) =>
    api.post<Tokens>('/auth/register', { name, email, password, deviceName: DEVICE }, { auth: false }),

  me: () => api.get<MeResponse>('/auth/me'),

  /** Best effort: never block a sign-out on the network. */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', { refreshToken: getSession().refreshToken }, { auth: false });
    } catch {
      /* the local session is cleared regardless */
    }
  },
};
