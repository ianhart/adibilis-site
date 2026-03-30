import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const isHome = location.pathname === '/'

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      el.focus({ preventScroll: true })
    }
  }

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#e6dacd] bg-[#fbf6ef]/88 backdrop-blur-xl"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex min-h-[44px] items-center gap-3 no-underline"
            aria-label="Adibilis home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#bf5b3d_0%,#304236_100%)] text-sm font-bold text-white shadow-[0_12px_24px_rgba(94,74,55,0.18)]">
              A
            </span>
            <span>
              <span className="block font-display text-lg font-semibold tracking-tight text-text">
                Adibilis
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a4a34]">
                Scan · Fix · Assist
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-1 rounded-full border border-[#e0d4c7] bg-[#fffaf4]/90 px-2 py-1 shadow-[0_10px_30px_rgba(95,78,61,0.08)] md:flex"
          >
            {isHome ? (
              <>
                <button
                  onClick={() => scrollToSection('products')}
                  className="min-h-[44px] cursor-pointer rounded-full border-none bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-[#8a4a34]"
                >
                  Engines
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="min-h-[44px] cursor-pointer rounded-full border-none bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-[#8a4a34]"
                >
                  Workflow
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="min-h-[44px] cursor-pointer rounded-full border-none bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-[#8a4a34]"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection('compare')}
                  className="min-h-[44px] cursor-pointer rounded-full border-none bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-[#8a4a34]"
                >
                  Why Us
                </button>
              </>
            ) : (
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium text-text-secondary no-underline transition-colors hover:text-[#8a4a34]"
              >
                Back to home
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                to="/app"
                className="ml-2 inline-flex min-h-[44px] items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="ml-2 inline-flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm font-medium text-text-secondary no-underline transition-colors hover:text-[#8a4a34]"
                >
                  Log in
                </Link>
                <Link
                  to={isHome ? '/signup' : '/signup'}
                  className="inline-flex min-h-[44px] items-center rounded-full bg-[#bf5b3d] px-5 py-2 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a44c32]"
                >
                  Start free
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#e0d4c7] bg-[#fffaf4] p-2 text-text-secondary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="border-t border-[#e0d4c7] bg-[#fbf6ef] md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            {isHome ? (
              <>
                <button
                  onClick={() => scrollToSection('products')}
                  className="block w-full rounded-2xl border-none bg-transparent px-3 py-3 text-left text-base font-medium text-text-secondary"
                >
                  Engines
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="block w-full rounded-2xl border-none bg-transparent px-3 py-3 text-left text-base font-medium text-text-secondary"
                >
                  Workflow
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block w-full rounded-2xl border-none bg-transparent px-3 py-3 text-left text-base font-medium text-text-secondary"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection('compare')}
                  className="block w-full rounded-2xl border-none bg-transparent px-3 py-3 text-left text-base font-medium text-text-secondary"
                >
                  Why Us
                </button>
              </>
            ) : (
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full rounded-2xl px-3 py-3 text-base font-medium text-text-secondary no-underline"
              >
                Back to home
              </Link>
            )}
            {isAuthenticated ? (
              <Link
                to="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 block w-full rounded-2xl bg-primary px-5 py-3 text-center text-base font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-2xl px-3 py-3 text-base font-medium text-text-secondary no-underline"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 block w-full rounded-2xl bg-[#bf5b3d] px-5 py-3 text-center text-base font-semibold text-white no-underline transition-colors hover:bg-[#a44c32]"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
