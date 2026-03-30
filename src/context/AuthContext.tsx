/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiRequest, type AuthUser } from '../lib/api'

const STORAGE_KEY = 'adibilis.auth'

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isReady: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (input: { email: string; password: string; name: string; betaCode?: string }) => Promise<AuthUser>
  refreshUser: () => Promise<AuthUser | null>
  syncUser: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as { token: string | null; user: AuthUser | null }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function saveStoredSession(nextToken: string | null, nextUser: AuthUser | null) {
  if (!nextToken || !nextUser) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: nextToken,
      user: nextUser,
    }),
  )
}

const initialStoredSession =
  typeof window !== 'undefined' ? readStoredSession() : null

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(initialStoredSession?.token || null)
  const [user, setUser] = useState<AuthUser | null>(initialStoredSession?.user || null)
  const [isReady, setIsReady] = useState(!initialStoredSession?.token)

  const persistSession = (nextToken: string | null, nextUser: AuthUser | null) => {
    setToken(nextToken)
    setUser(nextUser)
    saveStoredSession(nextToken, nextUser)
  }

  const logout = () => {
    persistSession(null, null)
  }

  const refreshUser = async (activeToken = token) => {
    if (!activeToken) {
      persistSession(null, null)
      return null
    }

    try {
      const response = await apiRequest<{ user: AuthUser }>('/auth/me', {
        token: activeToken,
      })
      persistSession(activeToken, response.user)
      return response.user
    } catch {
      persistSession(null, null)
      return null
    }
  }

  const syncUser = (nextUser: AuthUser) => {
    persistSession(token, nextUser)
  }

  useEffect(() => {
    const hydratedToken = initialStoredSession?.token ?? null

    if (!hydratedToken) {
      return
    }

    let cancelled = false

    async function hydrateSession() {
      try {
        const response = await apiRequest<{ user: AuthUser }>('/auth/me', {
          token: hydratedToken,
        })

        if (cancelled) {
          return
        }

        setToken(hydratedToken)
        setUser(response.user)
        saveStoredSession(hydratedToken, response.user)
      } catch {
        if (cancelled) {
          return
        }

        setToken(null)
        setUser(null)
        saveStoredSession(null, null)
      } finally {
        if (!cancelled) {
          setIsReady(true)
        }
      }
    }

    void hydrateSession()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      json: { email, password },
    })

    persistSession(response.token, response.user)
    return response.user
  }

  const register = async (input: { email: string; password: string; name: string; betaCode?: string }) => {
    const response = await apiRequest<{ token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      json: input,
    })

    persistSession(response.token, response.user)
    return response.user
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isReady,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        refreshUser: () => refreshUser(),
        syncUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
