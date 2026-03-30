import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PublicScanPage from './pages/PublicScanPage'
import MarketingLayout from './layouts/MarketingLayout'
import AppLayout from './layouts/AppLayout'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import BillingPage from './pages/BillingPage'
import { AuthProvider, useAuth } from './context/AuthContext'

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-surface px-4 py-24">
      <div className="mx-auto max-w-xl rounded-[32px] border border-border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Loading</p>
        <h1 className="mt-3 text-3xl font-bold text-text">Opening your Adibilis workspace...</h1>
      </div>
    </main>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

function GuestOnlyRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isReady } = useAuth()

  if (!isReady) {
    return <LoadingScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan/:scanId" element={<PublicScanPage />} />
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <AuthPage mode="login" />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestOnlyRoute>
                <AuthPage mode="signup" />
              </GuestOnlyRoute>
            }
          />
        </Route>

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
