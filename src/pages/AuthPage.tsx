import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AuthMode = 'login' | 'signup'

export default function AuthPage({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const isSignup = mode === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [betaCode, setBetaCode] = useState(searchParams.get('code') || '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const destination =
    (location.state as { from?: string } | null)?.from || '/app'

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (isSignup) {
        await register({ name, email, password, betaCode: betaCode.trim() || undefined })
      } else {
        await login(email, password)
      }

      navigate(destination, { replace: true })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to complete authentication',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="main-content" className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[32px] border border-border bg-white p-6 shadow-sm lg:grid-cols-[1.05fr,0.95fr] lg:p-8">
          <section className="rounded-[28px] bg-[#0f2f57] p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              {isSignup ? 'Start onboarding' : 'Welcome back'}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">
              {isSignup ? 'Create your Adibilis workspace.' : 'Open your accessibility control center.'}
            </h1>
            <p className="mt-4 text-base leading-7 text-blue-100">
              {isSignup
                ? 'Sign up and start scanning today. Have a beta code? Enter it during registration to unlock a paid plan free for 30 days.'
                : 'Return to your dashboard to launch scans, review remediation, and manage the features on your current plan.'}
            </p>
            <div className="mt-8 space-y-4">
              {[
                'WCAG-grounded findings powered by your standards library',
                'Platform-aware remediation for WordPress, Shopify, Wix, Squarespace, and Square',
                'Free workspaces keep scan history, while paid plans add AIDA and barrier reporting',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                    •
                  </span>
                  <p className="m-0 text-sm text-blue-100">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-2 sm:p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              {isSignup ? 'Sign up' : 'Log in'}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-text">
              {isSignup ? 'Set up your account' : 'Continue to your dashboard'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">
              {isSignup
                ? 'Create your account to save daily scans in one workspace and unlock paid features only when you need them.'
                : 'Use the credentials you created during signup to reopen your workspace.'}
            </p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text"
                    placeholder="Jamie Rivera"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text"
                  placeholder="you@example.com"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text"
                  placeholder="At least 8 characters"
                />
              </label>

              {isSignup && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-text">
                    Beta code{' '}
                    <span className="font-normal text-text-secondary">(optional)</span>
                  </span>
                  <input
                    type="text"
                    value={betaCode}
                    onChange={(event) => setBetaCode(event.target.value)}
                    className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text uppercase tracking-wider"
                    placeholder="e.g. REDDIT-BETA-50"
                    autoComplete="off"
                  />
                  {betaCode.trim() && (
                    <p className="mt-2 text-xs text-success">
                      Beta codes unlock free access to a paid plan for 30 days.
                    </p>
                  )}
                </label>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting
                  ? isSignup
                    ? 'Creating workspace...'
                    : 'Logging in...'
                  : isSignup
                    ? 'Create account'
                    : 'Log in'}
              </button>
            </form>

            <p className="mt-6 text-sm text-text-secondary">
              {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
              <Link to={isSignup ? '/login' : '/signup'} className="font-semibold text-primary">
                {isSignup ? 'Log in' : 'Create one'}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
