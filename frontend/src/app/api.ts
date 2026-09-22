import axios from 'axios'
import { config } from '../config'

export const api = axios.create({
  baseURL: config.API_URL,
  withCredentials: true,
})

// Request interceptor: attach Bearer token if available in localStorage
api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('tabvault_access_token')
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`
  }
  return reqConfig
})

// Track in-flight refresh promise to deduplicate concurrent refresh requests across parallel queries
let refreshPromise: Promise<unknown> | null = null

// Handle token refresh
api.interceptors.response.use(
  (response) => {
    // Automatically capture tokens if returned in login/refresh response
    if (response.data?.data?.accessToken) {
      localStorage.setItem('tabvault_access_token', response.data.data.accessToken)
    }
    if (response.data?.data?.refreshToken) {
      localStorage.setItem('tabvault_refresh_token', response.data.data.refreshToken)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Don't try to refresh if we're already on an auth page or if this is an auth endpoint
    const isAuthPage = window.location.pathname.startsWith('/auth')
    const isAuthEndpoint = originalRequest.url?.includes('/auth/')

    // If we get 401, try to refresh token via cookie or stored refreshToken
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthPage && !isAuthEndpoint) {
      originalRequest._retry = true

      if (!refreshPromise) {
        const storedRefreshToken = localStorage.getItem('tabvault_refresh_token')
        refreshPromise = axios
          .post(
            `${config.API_URL}/auth/refresh`,
            storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
            { withCredentials: true }
          )
          .then((res) => {
            if (res.data?.data?.accessToken) {
              localStorage.setItem('tabvault_access_token', res.data.data.accessToken)
            }
            if (res.data?.data?.refreshToken) {
              localStorage.setItem('tabvault_refresh_token', res.data.data.refreshToken)
            }
            return res
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      try {
        await refreshPromise
        const newToken = localStorage.getItem('tabvault_access_token')
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return api(originalRequest)
      } catch (refreshError: any) {
        localStorage.removeItem('tabvault_access_token')
        localStorage.removeItem('tabvault_refresh_token')
        const isAuthFailure =
          refreshError?.response?.status === 401 || refreshError?.response?.status === 403
        if (!isAuthPage && isAuthFailure) {
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
