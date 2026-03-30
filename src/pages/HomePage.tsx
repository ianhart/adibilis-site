import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import FadeInSection from '../components/FadeInSection'
import { createPublicScan } from '../lib/publicScan'

const heroHighlights = [
  {
    value: '3 free scans',
    label: 'Anonymous visitors get three scans per IP or domain before signup.',
  },
  {
    value: 'Source-code fixes',
    label: 'Findings are grounded in the NotebookLM-backed standards source.',
  },
  {
    value: 'Live visitor support',
    label: 'Paid plans bundle the live assistant with barrier reporting and monitoring.',
  },
]

const overlayFailures = [
  {
    title: 'Surface widgets do not repair source code',
    description:
      'Broken semantics, keyboard traps, missing labels, and bad heading order still live in the DOM until the code changes.',
  },
  {
    title: 'Each platform needs a different remediation path',
    description:
      'A serious accessibility workflow has to understand whether a site is custom, Shopify, WordPress, Wix, Squarespace, or something else.',
  },
  {
    title: 'Real users still need live support',
    description:
      'Even during remediation, visitors need orientation, shortcuts, and a reliable way to report what automation could not catch.',
  },
]

const engineCards = [
  {
    badge: 'For website owners',
    title: 'We fix your source code.',
    description:
      'Not an overlay. We scan your site, map issues to WCAG guidance, and route real remediation work with platform-aware fix paths.',
    image: '/freepik/dashboard-engine.jpg',
    alt: 'Illustration of a dashboard and analytics interface',
    features: [
      'Maps findings to exact WCAG criteria and conformance level',
      'Separates automated findings from manual verification work',
      'Routes fixes differently for custom code, CMS themes, and closed builders',
      'Produces report, remediation, and audit-trail artifacts for the workspace',
    ],
    footer:
      'Powered by Tirani. Best fit for custom codebases, React, Next.js, static sites, plus assisted flows for WordPress and Shopify.',
  },
  {
    badge: 'For people with disabilities',
    title: 'We help you navigate.',
    description:
      'A live accessibility assistant that helps visitors navigate in the moment with page orientation, assistive shortcuts, display preferences, and a direct line back to your team.',
    image: '/freepik/screen-reader.jpg',
    alt: 'Illustration of a blind visitor and a screen-reader accessibility interface',
    features: [
      'Works alongside assistive technology instead of replacing it',
      'Offers page-level guidance, orientation, and shortcut discovery',
      'Lets people submit barrier reports directly into your dashboard',
      'Gives teams a user-feedback loop that pure scanners never provide',
    ],
    footer:
      'Powered by AIDA. Included across paid tiers so support and remediation move together instead of as separate projects.',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Run a free Tirani scan',
    description:
      'Scan a public URL and get a WCAG-grounded preview of pass rate, top findings, and platform detection before you create an account.',
  },
  {
    step: '02',
    title: 'Create the workspace',
    description:
      'Carry your scan into the dashboard, connect the site, and let Tirani classify the platform so fixes can be routed correctly.',
  },
  {
    step: '03',
    title: 'Ship remediation',
    description:
      'Apply direct patches where possible and use guided implementation where platforms lock down the markup.',
  },
  {
    step: '04',
    title: 'Install AIDA and monitor',
    description:
      'Install the assistant, collect barrier reports, and keep scanning so regressions are caught before they become legal or customer problems.',
  },
]

const platformTracks = [
  {
    label: 'Direct patch support',
    platforms: 'Custom sites, React, Next.js, static HTML',
    description:
      'Tirani can propose code-level changes when the source is under your control and ready to ship through a normal engineering workflow.',
  },
  {
    label: 'Assisted fix flows',
    platforms: 'WordPress, Shopify',
    description:
      'Theme- and template-aware remediation is possible when the platform exposes enough surface area for structured updates.',
  },
  {
    label: 'Guided remediation',
    platforms: 'Wix, Squarespace, Square',
    description:
      'Closed builders still get issue mapping, editor instructions, and manual verification notes instead of false promises about invisible auto-fixes.',
  },
]

const comparisonRows = [
  {
    feature: 'Fixes the source code',
    adibilis: 'Yes',
    overlay: 'No',
    manual: 'Yes',
  },
  {
    feature: 'Maps findings to WCAG criteria',
    adibilis: 'Exact mapping',
    overlay: 'Partial',
    manual: 'Yes',
  },
  {
    feature: 'Routes fixes by platform',
    adibilis: 'Yes',
    overlay: 'No',
    manual: 'Depends',
  },
  {
    feature: 'Provides a live visitor assistant',
    adibilis: 'Yes',
    overlay: 'Often intrusive',
    manual: 'No',
  },
  {
    feature: 'Captures barrier reports from users',
    adibilis: 'Yes',
    overlay: 'Rarely',
    manual: 'No',
  },
  {
    feature: 'Maintains ongoing monitoring',
    adibilis: 'Yes',
    overlay: 'Surface-level only',
    manual: 'No',
  },
]

const pricingPlans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'Run daily single-page scans, save the history, and upgrade only when you need automation.',
    features: [
      '3 anonymous scans before signup',
      '3 dashboard scans per day after signup',
      'Saved scan history',
      'WCAG-grounded scan results',
    ],
    cta: 'Run free scan',
    featured: false,
  },
  {
    name: 'Starter',
    monthlyPrice: 49,
    annualPrice: 39,
    description: 'Recurring scans and guided remediation for small sites and lean teams.',
    features: [
      '1 site, up to 25 pages',
      'Weekly Tirani scans',
      'Top 15 remediation patches',
      'AIDA installation support',
    ],
    cta: 'Create workspace',
    featured: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 149,
    annualPrice: 119,
    description: 'Full remediation planning, reporting, and monitoring for growing teams.',
    features: [
      '1 site, up to 200 pages',
      'Daily Tirani scans',
      'Full remediation plan',
      'VPAT and accessibility statement generation',
    ],
    cta: 'Start Pro workflow',
    featured: true,
  },
  {
    name: 'Business',
    monthlyPrice: 299,
    annualPrice: 239,
    description: 'For organizations that need monitoring, barrier triage, and onboarding support.',
    features: [
      '1 site, up to 1,000 pages',
      'Daily scans plus monitoring',
      'Barrier report workflow',
      'Priority onboarding support',
    ],
    cta: 'Talk to onboarding',
    featured: false,
  },
]

type ScanState = 'idle' | 'scanning' | 'error'

interface SignupPromptState {
  message: string
  freeScanLimit: number
}

function getComparisonTone(value: string) {
  const normalized = value.toLowerCase()

  if (normalized.includes('yes') || normalized.includes('exact')) {
    return 'bg-[#edf1eb] text-[#304236] ring-1 ring-[#d7e0d2]'
  }

  if (normalized.includes('no')) {
    return 'bg-[#f6e4de] text-[#8a4a34] ring-1 ring-[#ecd0c6]'
  }

  return 'bg-[#f4ead8] text-[#8d6928] ring-1 ring-[#ead9ba]'
}

export default function HomePage() {
  const navigate = useNavigate()
  const [annualBilling, setAnnualBilling] = useState(false)
  const [scanUrl, setScanUrl] = useState('')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [signupPrompt, setSignupPrompt] = useState<SignupPromptState | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setScanState('scanning')
    setSignupPrompt(null)
    setScanError(null)

    try {
      const { response, data } = await createPublicScan(scanUrl)

      if (!response.ok || !data.scanId) {
        if (data.requiresSignup) {
          setSignupPrompt({
            message: data.error || 'You have reached the free scan limit. Create an account to continue.',
            freeScanLimit: data.freeScanLimit || 3,
          })
          setScanState('idle')
          return
        }

        throw new Error(data.error || 'Unable to start scan')
      }

      navigate(`/scan/${data.scanId}`)
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Something went wrong. Please try again.'

      setScanError(message)
      setScanState('error')
    }
  }

  return (
    <main id="main-content" role="main" className="overflow-hidden">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f5eadc_0%,#fdf9f4_45%,#f3ece4_100%)] pb-18 pt-10 sm:pb-24 sm:pt-16">
        <div className="absolute inset-0">
          <div className="absolute left-[-6rem] top-20 h-40 w-40 rounded-full bg-[#e4bc83]/55 blur-3xl" />
          <div className="absolute right-[-4rem] top-0 h-56 w-56 rounded-full bg-[#d9c5b8]/70 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#d6e0d0]/60 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <FadeInSection>
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-[#deccbc] bg-[#fff9f3]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#8a4a34] shadow-[0_10px_24px_rgba(95,78,61,0.06)]">
                  Accessibility from two sides
                </span>
                <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl xl:text-[4.2rem] xl:leading-[1.04]">
                  Making the web work for everyone.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">
                  Millions of people with disabilities still hit barriers online. Adibilis tackles
                  that from two sides: fixing the source code that breaks accessibility, and giving
                  visitors the support they need to navigate on their own terms.
                </p>

                <div
                  id="scan"
                  className="mt-8 rounded-[30px] border border-[#ddcebf] bg-[#fffaf4]/92 p-5 shadow-[0_20px_60px_rgba(95,78,61,0.1)] backdrop-blur sm:p-6"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Free scan
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">
                        Run Tirani on a live page before you create a workspace.
                      </h2>
                    </div>
                    <p className="text-sm text-text-secondary">No card required.</p>
                  </div>

                  <form
                    onSubmit={handleScanSubmit}
                    className="mt-5 flex flex-col gap-3 md:flex-row"
                    aria-label="Website scan form"
                  >
                    <label htmlFor="scan-url" className="sr-only">
                      Your website URL
                    </label>
                    <input
                      id="scan-url"
                      type="url"
                      required
                      placeholder="https://yoursite.com"
                      value={scanUrl}
                      onChange={(e) => setScanUrl(e.target.value)}
                      className="min-h-[52px] flex-1 rounded-full border border-[#d7cabd] bg-[#f7f1e9] px-5 text-base text-text outline-none transition-colors focus:border-primary"
                    />
                    <button
                      type="submit"
                      disabled={scanState === 'scanning'}
                      className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[#304236] px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-[#243229] disabled:cursor-wait disabled:opacity-70"
                    >
                      {scanState === 'scanning' ? 'Running Tirani...' : 'Run Tirani free scan'}
                    </button>
                  </form>

                  {scanState === 'idle' && !signupPrompt && (
                    <p className="mt-3 text-sm text-text-secondary">
                      Tirani checks only the exact page you paste here, maps the findings to WCAG
                      guidance, and shows what can move into remediation before you create a
                      workspace.
                    </p>
                  )}
                  {scanState === 'scanning' && (
                    <p className="mt-3 text-sm text-primary">
                      Your free accessibility preview is running now.
                    </p>
                  )}
                  {signupPrompt && (
                    <div className="mt-5 rounded-[24px] border border-[#e1cfc3] bg-[#f8eee8] p-5">
                      <p className="font-display text-xl font-semibold text-text">
                        Free scan limit reached
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        {signupPrompt.message}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Anonymous visitors get {signupPrompt.freeScanLimit} free scan
                        {signupPrompt.freeScanLimit === 1 ? '' : 's'} per IP or domain.
                        Create a workspace to keep scanning, store reports, and unlock Tirani +
                        AIDA onboarding.
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Link
                          to="/signup"
                          className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
                        >
                          Create free account
                        </Link>
                        <Link
                          to="/login"
                          className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#dbcabc] bg-white px-5 py-3 text-sm font-semibold text-text no-underline transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34]"
                        >
                          Log in
                        </Link>
                      </div>
                    </div>
                  )}
                  {scanState === 'error' && (
                    <p className="mt-3 text-sm text-error">
                      {scanError || 'Something went wrong. Please try again.'}
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {heroHighlights.map((item) => (
                    <div
                      key={item.value}
                      className="rounded-[22px] border border-[#e3d6ca] bg-[#fff9f3]/78 px-4 py-3 shadow-[0_14px_32px_rgba(95,78,61,0.05)] backdrop-blur"
                    >
                      <p className="font-display text-base font-semibold text-text">{item.value}</p>
                      <p className="mt-1 text-xs leading-6 text-text-secondary">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="relative mx-auto max-w-[34rem]">
                <div className="absolute -left-4 top-14 hidden h-28 w-28 rounded-full bg-[#e0b57a]/70 blur-3xl sm:block" />
                <div className="absolute -right-2 top-5 hidden h-32 w-32 rounded-full bg-[#ccb7a4]/70 blur-3xl sm:block" />
                <div className="relative overflow-hidden rounded-[34px] border border-[#4a5b49]/30 bg-[#304236] p-4 shadow-[0_30px_90px_rgba(58,47,39,0.28)]">
                  <div className="grid gap-4">
                    <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                        First showcase
                      </p>
                      <p className="mt-2 font-display text-2xl font-semibold">
                        Two sides of the product.
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-200">
                        One side helps website owners fix the source. The other helps people use
                        the site while the remediation work is still in motion.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          For website owners
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold">
                          We fix your source code.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          We scan your site, find accessibility issues, and route the fixes your
                          team can actually apply.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          For people with disabilities
                        </p>
                        <p className="mt-2 font-display text-2xl font-semibold">
                          We help you navigate.
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          A live assistant offers orientation, shortcuts, and a direct path to
                          report barriers while your team fixes the source.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[28px] bg-[#dfe9f5]">
                      <img
                        src="/freepik/hero-accessibility.jpg"
                        alt="Illustration of an accessible website interface with a visitor using assistive technology"
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          Remediation routing
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          Direct patches where the source is open. Guided fixes where the platform
                          limits access.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          Visitor support
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          AIDA stays available after the scan so users can navigate and report real
                          barriers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[#7a695c]">
                  Hero and product illustrations licensed via Freepik.
                </p>
              </div>
            </FadeInSection>
          </div>

        </div>
      </section>

      <section id="products" className="bg-[#f2ebe1] py-20 sm:py-24" tabIndex={-1}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Meet the engines
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                One side fixes the code. One side helps people use the site.
              </h2>
              <p className="mt-4 text-lg leading-8 text-text-secondary">
                Explain the product in plain language first. Then show the engine names inside the
                workflow: Tirani is the scan-and-remediation system, and AIDA is the live assistant
                for the visitor.
              </p>
            </div>
          </FadeInSection>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {engineCards.map((card) => (
              <FadeInSection key={card.title}>
                <article className="overflow-hidden rounded-[32px] border border-[#dccfc0] bg-[#fffaf4] shadow-[0_24px_70px_rgba(95,78,61,0.06)]">
                  <div className="aspect-[4/3] overflow-hidden bg-[#efe4d7]">
                    <img
                      src={card.image}
                      alt={card.alt}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-7 sm:p-8">
                    <span className="inline-flex rounded-full bg-[#f3e1da] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8a4a34]">
                      {card.badge}
                    </span>
                    <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-text">
                      {card.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">{card.description}</p>
                    <ul className="mt-6 space-y-3" role="list">
                      {card.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-6 rounded-[22px] bg-[#f5eee6] px-4 py-4 text-sm leading-7 text-text">
                      {card.footer}
                    </p>
                  </div>
                </article>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbf5ee] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Why the category is broken
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                Accessibility is not a widget problem. It is a code and workflow problem.
              </h2>
              <p className="mt-4 text-lg leading-8 text-text-secondary">
                The fastest way to make a site more accessible is to stop pretending overlays can
                remediate the source. Adibilis is built around the operational work that actually
                has to happen.
              </p>
            </div>
          </FadeInSection>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {overlayFailures.map((item, index) => (
              <FadeInSection key={item.title}>
                <article className="h-full rounded-[28px] border border-border bg-[#fff9f3] p-6 shadow-[0_16px_40px_rgba(95,78,61,0.04)]">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3e1da] font-display text-lg font-semibold text-[#8a4a34]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-text">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                </article>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#304236] py-20 text-white sm:py-24" tabIndex={-1}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2c8b8]">
                Rollout workflow
              </p>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                The path from free scan to monitored accessibility workflow.
              </h2>
            </div>
          </FadeInSection>

          <div className="mt-12 grid gap-6 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <FadeInSection key={step.step}>
                <article className="h-full rounded-[28px] border border-white/10 bg-white/8 p-6 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f2c8b8]">
                    Step {step.step}
                  </p>
                  <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-slate-200">{step.description}</p>
                </article>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      <section id="compare" className="bg-[#fbf5ee] py-20 sm:py-24" tabIndex={-1}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <FadeInSection>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Platform reality
                </p>
                <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-text">
                  One accessibility engine. Different implementation tracks.
                </h2>
                <p className="mt-4 text-sm leading-7 text-text-secondary">
                  Tirani is honest about what can be patched directly and what still needs guided
                  remediation. That makes the product safer to trust across open and closed
                  platforms.
                </p>
                <div className="mt-8 space-y-4">
                  {platformTracks.map((track) => (
                    <div key={track.label} className="rounded-[24px] border border-border bg-[#fff9f3] p-5">
                      <p className="font-display text-xl font-semibold text-text">{track.label}</p>
                      <p className="mt-2 text-sm font-semibold text-primary">{track.platforms}</p>
                      <p className="mt-3 text-sm leading-7 text-text-secondary">{track.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInSection>

            <FadeInSection>
              <div className="overflow-hidden rounded-[32px] border border-border bg-[#fffdf8] shadow-[0_20px_70px_rgba(95,78,61,0.05)]">
                <div className="border-b border-border px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Why teams switch
                  </p>
                  <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text">
                    The warmth of a mission-led brand, with the discipline of a real accessibility workflow.
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Comparison of accessibility approaches</caption>
                    <thead>
                      <tr className="border-b border-border bg-[#f8f1e8]">
                        <th className="px-6 py-4 text-sm font-semibold text-text">Capability</th>
                        <th className="px-6 py-4 text-sm font-semibold text-primary">Adibilis</th>
                        <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                          Overlay widget
                        </th>
                        <th className="px-6 py-4 text-sm font-semibold text-text-secondary">
                          Manual audit only
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row) => (
                        <tr key={row.feature} className="border-b border-border last:border-b-0">
                          <td className="px-6 py-4 text-sm font-medium text-text">{row.feature}</td>
                          {[row.adibilis, row.overlay, row.manual].map((value, columnIndex) => (
                            <td
                              key={`${row.feature}-${columnIndex}`}
                              className="px-6 py-4 text-sm text-text-secondary"
                            >
                              <span
                                className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${getComparisonTone(value)}`}
                              >
                                {value}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-[#f2ebe1] py-20 sm:py-24" tabIndex={-1}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Pricing
              </p>
              <div className="mt-4 inline-flex rounded-full border border-[#d7a83c]/40 bg-[#fff8e6] px-4 py-2 text-sm font-semibold text-[#8d6928]">
                Open beta — use code <code className="mx-1.5 rounded bg-[#f0e4c4] px-2 py-0.5 font-mono text-xs">REDDIT-BETA-50</code> for 30 days free on Pro
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                Start with the free preview, then choose the rollout that matches your stack.
              </h2>
              <p className="mt-4 text-lg leading-8 text-text-secondary">
                Every paid tier keeps AIDA in the bundle so remediation and live visitor support
                stay connected.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span
                className={`text-sm font-medium ${
                  !annualBilling ? 'text-text' : 'text-text-secondary'
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={annualBilling}
                aria-label="Toggle annual billing"
                onClick={() => setAnnualBilling((value) => !value)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border-none transition-colors ${
                  annualBilling ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white transition-transform ${
                    annualBilling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${
                  annualBilling ? 'text-text' : 'text-text-secondary'
                }`}
              >
                Annual <span className="font-semibold text-[#8a4a34]">(save 20%)</span>
              </span>
            </div>
          </FadeInSection>

          <div className="mt-12 grid gap-6 xl:grid-cols-4">
            {pricingPlans.map((plan) => {
              const displayedPrice = annualBilling ? plan.annualPrice : plan.monthlyPrice

              return (
                <FadeInSection key={plan.name}>
                  <article
                    className={`flex h-full flex-col rounded-[30px] border p-6 ${
                      plan.featured
                        ? 'border-[#bf5b3d] bg-[#fffaf4] shadow-[0_28px_70px_rgba(191,91,61,0.12)]'
                        : 'border-border bg-[#fffdf8]'
                    }`}
                  >
                    {plan.featured && (
                      <span className="inline-flex self-start rounded-full bg-[#bf5b3d] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                        Recommended
                      </span>
                    )}
                    <h3 className="mt-4 font-display text-2xl font-semibold text-text">{plan.name}</h3>
                    <div className="mt-4">
                      <span className="font-display text-5xl font-semibold text-text">
                        ${displayedPrice}
                      </span>
                      <span className="ml-1 text-sm text-text-secondary">/mo</span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-text-secondary">{plan.description}</p>
                    <ul className="mt-6 flex-1 space-y-3" role="list">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-text-secondary">
                          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.name === 'Free' ? (
                      <a
                        href="#scan"
                        className={`mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-3 text-sm font-semibold no-underline transition-colors ${
                          plan.featured
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'border border-border text-text hover:border-[#bf5b3d] hover:text-[#8a4a34]'
                        }`}
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link
                        to="/signup"
                        className={`mt-8 inline-flex min-h-[48px] items-center justify-center rounded-full px-5 py-3 text-sm font-semibold no-underline transition-colors ${
                          plan.featured
                            ? 'bg-primary text-white hover:bg-primary-dark'
                            : 'border border-border text-text hover:border-[#bf5b3d] hover:text-[#8a4a34]'
                        }`}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </article>
                </FadeInSection>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#304236_0%,#3d5642_55%,#bf5b3d_100%)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <FadeInSection>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f3d7cc]">
              Start here
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Use the free scan to see the issues. Use the workspace to actually fix them.
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[#f7eee8]">
              Adibilis is designed for the real rollout: finding the problem, routing the fix,
              supporting the user today, and keeping watch after launch.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#scan"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 py-3 text-base font-semibold text-[#0c1d33] no-underline transition-colors hover:bg-blue-50"
              >
                Run free scan
              </a>
              <Link
                to="/signup"
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/25 px-7 py-3 text-base font-semibold text-white no-underline transition-colors hover:bg-white/10"
              >
                Create workspace
              </Link>
            </div>
          </FadeInSection>
        </div>
      </section>
    </main>
  )
}
