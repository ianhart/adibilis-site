import { Link, Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function BetaBanner() {
  return (
    <div className="bg-[#304236] px-4 py-2.5 text-center text-sm text-white">
      <span className="mr-2 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
        Beta
      </span>
      Adibilis is in open beta.{' '}
      <Link
        to="/signup?code=REDDIT-BETA-50"
        className="font-semibold text-[#e4bc83] underline decoration-[#e4bc83]/40 underline-offset-2 transition-colors hover:text-white"
      >
        Sign up with a beta code
      </Link>{' '}
      for 30 days free on the Pro plan.
    </div>
  )
}

export default function MarketingLayout() {
  return (
    <>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>
      <BetaBanner />
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
