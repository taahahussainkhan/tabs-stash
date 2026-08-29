import axios from 'axios'
import { config } from '../config'

export const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true, // Enable sending cookies with requests
})

// No manual Authorization header needed - cookies sent automatically
// The backend sets httpOnly cookies which are handled by the browser

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Don't try to refresh if we're already on an auth page or if this is an auth endpoint
    const isAuthPage = window.location.pathname.startsWith('/auth')
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')

    // If we get 401, try to refresh token via cookie (but not on auth pages/endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthPage && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        // Refresh endpoint will use the refresh_token cookie automatically
        await axios.post(
          `${config.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        )

        // New access token cookie has been set by the backend
        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login (only if not already there)
        if (!isAuthPage) {
          window.location.href = '/auth/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth functions
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  signup: (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    username?: string
  }) => api.post('/auth/signup', userData),

  logout: () => api.post('/auth/logout'),

  // Refresh uses cookies now, no need to pass token
  refreshToken: () => api.post('/auth/refresh'),

  getCurrentUser: () => api.get('/auth/me')
}

// Settings functions
export const settingsApi = {
  getSettings: () => api.get('/user/settings'),
  updateSettings: (settingsData: any) => api.put('/user/settings', settingsData),
  updateLayout: (layoutData: any) => api.patch('/user/settings/layout', null, { params: layoutData }),
  updateDashboard: (dashboardData: any) => api.patch('/user/settings/dashboard', dashboardData)
}
