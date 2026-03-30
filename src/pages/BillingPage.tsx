import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../lib/api'

interface BillingPlan {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  description: string
  features: string[]
}

interface BillingResponse {
  provider: string
  mode: string
  currentPlan: BillingPlan
  billingStatus: string
  user: {
    id: string
    email: string
    name: string | null
    plan: string
  }
  activatedAt: string
  plans: BillingPlan[]
}

export default function BillingPage() {
  const { token, syncUser, user } = useAuth()
  const [annualBilling, setAnnualBilling] = useState(false)
  const [billing, setBilling] = useState<BillingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingPlan, setIsUpdatingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadBilling() {
      if (!token) {
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiRequest<BillingResponse>('/billing', { token })
        if (!cancelled) {
          setBilling(response)
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load billing')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadBilling()

    return () => {
      cancelled = true
    }
  }, [token])

  const handleCheckout = async (planId: string) => {
    if (!token) {
      return
    }

    setIsUpdatingPlan(planId)
    setError(null)
    setMessage(null)

    try {
      const response = await apiRequest<{
        message: string
        user: {
          id: string
          email: string
          name: string | null
          plan: string
        }
      }>('/billing/checkout', {
        method: 'POST',
        token,
        json: { planId },
      })

      syncUser(response.user)
      setBilling((current) =>
        current
          ? {
              ...current,
              billingStatus: response.user.plan === 'free' ? 'free' : 'active',
              currentPlan:
                current.plans.find((plan) => plan.id === response.user.plan) || current.currentPlan,
              user: response.user,
            }
          : current,
      )
      setMessage(response.message)
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to update plan')
    } finally {
      setIsUpdatingPlan(null)
    }
  }

  const [betaCodeInput, setBetaCodeInput] = useState('')
  const [isRedeemingBeta, setIsRedeemingBeta] = useState(false)

  const handleRedeemBeta = async () => {
    if (!token || !betaCodeInput.trim()) {
      return
    }

    setIsRedeemingBeta(true)
    setError(null)
    setMessage(null)

    try {
      const response = await apiRequest<{
        message: string
        user: { id: string; email: string; name: string | null; plan: string }
      }>('/billing/redeem-beta', {
        method: 'POST',
        token,
        json: { code: betaCodeInput.trim() },
      })

      syncUser(response.user)
      setMessage(response.message)
      setBetaCodeInput('')

      // Reload billing state
      const billingResponse = await apiRequest<BillingResponse>('/billing', { token })
      setBilling(billingResponse)
    } catch (redeemError) {
      setError(redeemError instanceof Error ? redeemError.message : 'Unable to redeem beta code')
    } finally {
      setIsRedeemingBeta(false)
    }
  }

  return (
    <div className="space-y-6">
      {user?.plan === 'free' && (
        <section className="rounded-[32px] border-2 border-dashed border-[#d7a83c]/50 bg-[#fffdf4] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8d6928]">
                Beta access
              </p>
              <h3 className="mt-2 text-2xl font-bold text-text">Have a beta code?</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
                Beta codes unlock free access to a paid plan for 30 days. Enter yours below.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={betaCodeInput}
              onChange={(e) => setBetaCodeInput(e.target.value)}
              placeholder="e.g. REDDIT-BETA-50"
              className="flex-1 rounded-2xl border border-border px-4 py-3 text-base uppercase tracking-wider text-text"
              autoComplete="off"
            />
            <button
              type="button"
              disabled={!betaCodeInput.trim() || isRedeemingBeta}
              onClick={() => void handleRedeemBeta()}
              className="rounded-2xl bg-[#8d6928] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7a5b22] disabled:opacity-70"
            >
              {isRedeemingBeta ? 'Applying...' : 'Apply code'}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-[32px] bg-[#0f2f57] p-8 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Billing</p>
        <h2 className="mt-3 text-3xl font-bold">Choose the plan that fits your rollout.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
          Adibilis is in open beta. Use a beta code for free access, or activate a plan directly.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className={`text-sm font-medium ${!annualBilling ? 'text-white' : 'text-blue-200'}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annualBilling}
            aria-label="Toggle annual billing"
            onClick={() => setAnnualBilling((value) => !value)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              annualBilling ? 'bg-white/90' : 'bg-white/25'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-primary transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annualBilling ? 'text-white' : 'text-blue-200'}`}>
            Annual
          </span>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-success">
          {message}
        </div>
      )}

      <section className="rounded-[32px] border border-border bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Current plan</p>
            <h3 className="mt-2 text-2xl font-bold text-text">
              {billing?.currentPlan.name || user?.plan || 'Free'}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              Status: {billing?.billingStatus || (user?.plan === 'free' ? 'free' : 'active')}
            </p>
          </div>
          <div className="rounded-2xl bg-surface px-4 py-3 text-sm text-text-secondary">
            Provider: {billing?.provider || 'sandbox'}
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="rounded-[32px] border border-border bg-white p-8 text-sm text-text-secondary">
          Loading billing plans...
        </div>
      ) : (
        <section className="grid gap-6 xl:grid-cols-4">
          {(billing?.plans || []).map((plan) => {
            const isCurrent = billing?.currentPlan.id === plan.id
            const displayedPrice = annualBilling ? plan.annualPrice : plan.monthlyPrice

            return (
              <article
                key={plan.id}
                className={`rounded-[28px] border p-6 ${
                  isCurrent ? 'border-primary bg-primary-light' : 'border-border bg-white'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl font-bold text-text">
                  ${displayedPrice}
                  <span className="text-sm font-medium text-text-secondary">/mo</span>
                </p>
                <p className="mt-4 text-sm leading-6 text-text-secondary">{plan.description}</p>
                <ul className="mt-6 space-y-3 text-sm text-text-secondary">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={isCurrent || isUpdatingPlan === plan.id}
                  onClick={() => void handleCheckout(plan.id)}
                  className={`mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'cursor-default bg-white text-primary'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  } disabled:opacity-70`}
                >
                  {isCurrent
                    ? 'Current plan'
                    : isUpdatingPlan === plan.id
                      ? 'Updating...'
                      : 'Activate plan'}
                </button>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
