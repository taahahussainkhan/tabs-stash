/**
 * TabVault API Client
 * Manages communication with Express backend, JWT tokens, automatic token refresh, and Auth state.
 */

(function (global) {
  const API_BASE_URL = 'https://pdh9ryeacb.execute-api.ap-south-1.amazonaws.com/api/v1';

  class TabVaultApiClient {
    constructor() {
      this.baseUrl = API_BASE_URL;
      this.isRefreshing = false;
      this.refreshSubscribers = [];
    }

    /**
     * Get stored authentication data from storage
     */
    async getAuth() {
      const data = await TabVaultAPI.storage.local.get(['tabvault_auth']);
      return data.tabvault_auth || null;
    }

    /**
     * Save authentication tokens and user profile to storage
     */
    async setAuth(authData) {
      await TabVaultAPI.storage.local.set({ tabvault_auth: authData });
      this.notifyAuthChange(authData);
    }

    /**
     * Clear auth from storage (Logout)
     */
    async clearAuth() {
      const auth = await this.getAuth();
      if (auth && auth.refreshToken) {
        try {
          await fetch(`${this.baseUrl}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
          });
        } catch (e) {
          // ignore network error on logout
        }
      }
      await TabVaultAPI.storage.local.remove(['tabvault_auth']);
      this.notifyAuthChange(null);
    }

    /**
     * Check if user is currently logged in
     */
    async isAuthenticated() {
      const auth = await this.getAuth();
      return !!(auth && auth.accessToken);
    }

    /**
     * Get user profile
     */
    async getUser() {
      const auth = await this.getAuth();
      return auth ? auth.user : null;
    }

    /**
     * Register a new user
     */
    async register(email, password, name = '') {
      const res = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          deviceName: navigator.userAgent.includes('Firefox') ? 'Firefox Browser' : 'Chrome Browser',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Registration failed.');
      }

      await this.setAuth(data.data);
      return data.data;
    }

    /**
     * Login user
     */
    async login(email, password) {
      const res = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          deviceName: navigator.userAgent.includes('Firefox') ? 'Firefox Browser' : 'Chrome Browser',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Login failed.');
      }

      await this.setAuth(data.data);
      return data.data;
    }

    /**
     * Refresh access token
     */
    async refreshTokens() {
      const auth = await this.getAuth();
      if (!auth || !auth.refreshToken) {
        throw new Error('No refresh token available');
      }

      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: auth.refreshToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        await this.clearAuth();
        throw new Error(data.error?.message || 'Session expired. Please log in again.');
      }

      const newAuth = {
        ...auth,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      };

      await this.setAuth(newAuth);
      return newAuth.accessToken;
    }

    /**
     * Execute authenticated request with automatic token refresh on 401
     */
    async request(endpoint, options = {}) {
      const auth = await this.getAuth();
      const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (auth && auth.accessToken) {
        headers['Authorization'] = `Bearer ${auth.accessToken}`;
      }

      try {
        let res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers,
        });

        // If 401 Unauthorized, attempt token refresh and retry once
        if (res.status === 401 && auth && auth.refreshToken) {
          try {
            const newAccessToken = await this.refreshTokens();
            headers['Authorization'] = `Bearer ${newAccessToken}`;

            res = await fetch(`${this.baseUrl}${endpoint}`, {
              ...options,
              headers,
            });
          } catch (refreshErr) {
            throw new Error('Session expired. Please log in again.');
          }
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || `Request failed with status ${res.status}`);
        }

        return data;
      } catch (err) {
        throw err;
      }
    }

    /**
     * Execute delta sync against backend
     */
    async deltaSync(lastSyncedTimestamp, clientChanges) {
      return this.request('/sync', {
        method: 'POST',
        body: JSON.stringify({
          lastSyncedTimestamp: lastSyncedTimestamp || 0,
          clientChanges: clientChanges || [],
        }),
      });
    }

    /**
     * Fetch user profile & sync stats
     */
    async getMe() {
      return this.request('/auth/me', { method: 'GET' });
    }

    /**
     * Broadcast auth changes to any listening views
     */
    notifyAuthChange(authData) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tabvault:auth-change', { detail: authData }));
      }
    }
  }

  global.TabVaultApiClient = new TabVaultApiClient();
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);
