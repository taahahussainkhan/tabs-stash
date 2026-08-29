import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from './api'
import { queryClient } from '../lib/queryClient'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  username?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    username?: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
 
    authApi.getCurrentUser()
      .then(response => {
        setUser(response.data)
      })
      .catch(() => {

        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const login = async (email: string, password: string) => {
    try {
    
      await authApi.login(email, password)

      
      queryClient.clear()

    
      const userResponse = await authApi.getCurrentUser()
      setUser(userResponse.data)

      toast.success('Logged in successfully')
      navigate('/')
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? (error as Error)?.message ?? 'Login failed'
      toast.error(detail)
      throw error
    }
  }

  const signup = async (userData: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    username?: string
  }) => {
    try {
      await authApi.signup(userData)
      toast.success('Account created. You can now log in.')
      navigate('/auth/login')
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? (error as Error)?.message ?? 'Sign up failed'
      toast.error(detail)
      throw error
    }
  }

  const logout = async () => {
    try {
   
      await authApi.logout()
    } catch (error) {
   
      console.error('Logout API call failed:', error)
    } finally {
   
      setUser(null)

     
      queryClient.clear()

      toast.success('Logged out successfully')
      navigate('/auth/login')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
