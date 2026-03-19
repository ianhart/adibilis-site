import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
      el.focus({ preventScroll: true })
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="text-2xl font-bold text-primary no-underline flex items-center min-h-[44px]"
            aria-label="Adibilis home"
          >
            Adibilis
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollToSection('products')}
              className="px-3 py-2 text-text-secondary hover:text-primary rounded-md text-sm font-medium bg-transparent border-none cursor-pointer min-h-[44px]"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-2 text-text-secondary hover:text-primary rounded-md text-sm font-medium bg-transparent border-none cursor-pointer min-h-[44px]"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="px-3 py-2 text-text-secondary hover:text-primary rounded-md text-sm font-medium bg-transparent border-none cursor-pointer min-h-[44px]"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('compare')}
              className="px-3 py-2 text-text-secondary hover:text-primary rounded-md text-sm font-medium bg-transparent border-none cursor-pointer min-h-[44px]"
            >
              Compare
            </button>
            <button
              onClick={() => scrollToSection('scan')}
              className="ml-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-dark border-none cursor-pointer min-h-[44px] transition-colors"
            >
              Scan Your Site Free
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-primary bg-transparent border-none cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
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
          className="md:hidden border-t border-border bg-white"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => scrollToSection('products')}
              className="block w-full text-left px-3 py-3 text-text-secondary hover:text-primary rounded-md text-base font-medium bg-transparent border-none cursor-pointer"
            >
              Products
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left px-3 py-3 text-text-secondary hover:text-primary rounded-md text-base font-medium bg-transparent border-none cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left px-3 py-3 text-text-secondary hover:text-primary rounded-md text-base font-medium bg-transparent border-none cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('compare')}
              className="block w-full text-left px-3 py-3 text-text-secondary hover:text-primary rounded-md text-base font-medium bg-transparent border-none cursor-pointer"
            >
              Compare
            </button>
            <button
              onClick={() => scrollToSection('scan')}
              className="block w-full mt-2 px-5 py-3 bg-primary text-white rounded-lg text-base font-semibold hover:bg-primary-dark border-none cursor-pointer text-center transition-colors"
            >
              Scan Your Site Free
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
