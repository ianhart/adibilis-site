import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function navLinkClass(isActive: boolean) {
  return [
    'flex items-center rounded-xl px-4 py-3 text-sm font-semibold no-underline transition-colors',
    isActive ? 'bg-primary text-white' : 'text-text-secondary hover:bg-primary-light hover:text-primary',
  ].join(' ')
}

export default function AppLayout() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  return (
    <>
      <a href="#app-main" className="skip-nav">
        Skip to app content
      </a>
      <div className="min-h-screen bg-surface">
        <header className="border-b border-border bg-white" role="banner">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Adibilis Control Center
              </p>
              <h1 className="m-0 text-2xl font-bold text-text">
                {user?.plan === 'free' ? 'Tirani scan workspace' : 'Tirani + AIDA workspace'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-border bg-surface px-4 py-2 text-right sm:block">
                <p className="m-0 text-sm font-semibold text-text">{user?.name || user?.email}</p>
                <p className="m-0 text-xs uppercase tracking-wide text-text-secondary">
                  Plan: {user?.plan || 'free'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/', { replace: true })
                }}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text no-underline transition-colors hover:border-primary hover:text-primary"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[240px,1fr] lg:px-8">
          <aside className="rounded-3xl border border-border bg-white p-4">
            <nav aria-label="Dashboard navigation" className="space-y-2">
              <NavLink to="/app" end className={({ isActive }) => navLinkClass(isActive)}>
                Dashboard
              </NavLink>
              <NavLink to="/app/billing" className={({ isActive }) => navLinkClass(isActive)}>
                Billing
              </NavLink>
            </nav>
          </aside>

          <main id="app-main">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}
