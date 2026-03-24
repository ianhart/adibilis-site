import { useState } from 'react'
import FadeInSection from '../components/FadeInSection'

export default function HomePage() {
  const [annualBilling, setAnnualBilling] = useState(false)
  const [scanUrl, setScanUrl] = useState('')
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle')
  const [scanResult, setScanResult] = useState<{ passRate: number; violations: number; url: string } | null>(null)

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setScanState('scanning')
    setScanResult(null)
    try {
      const res = await fetch(`https://adibilis-api-production.up.railway.app/scan/free?url=${encodeURIComponent(scanUrl)}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setScanResult({ passRate: data.passRate, violations: data.violations?.length || 0, url: scanUrl })
      setScanState('done')
    } catch {
      setScanState('error')
    }
  }

  return (
    <main id="main-content" role="main">
      {/* ============ HERO ============ */}
      <section
        aria-labelledby="hero-heading"
        className="bg-white py-20 sm:py-28 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text tracking-tight leading-tight"
          >
            Making the web work for everyone.
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl text-text-secondary leading-relaxed">
            Millions of people with disabilities can&rsquo;t use most websites.
            We&rsquo;re changing that from two sides&nbsp;&mdash; fixing the code that
            breaks accessibility, and giving users the tools to navigate any site
            on their own terms.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-surface rounded-xl p-6 border border-border">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">For website owners</p>
              <p className="text-text font-bold text-lg mb-1">We fix your source code.</p>
              <p className="text-text-secondary text-sm">
                Not an overlay. We scan your site, find every accessibility violation,
                and generate real code patches you can apply directly.
              </p>
            </div>
            <div className="bg-surface rounded-xl p-6 border border-border">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">For people with disabilities</p>
              <p className="text-text font-bold text-lg mb-1">We help you navigate.</p>
              <p className="text-text-secondary text-sm">
                A digital assistant that scans any page, offers smart shortcuts,
                and works with your assistive technology&nbsp;&mdash; never against it.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#scan"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-dark no-underline min-h-[48px] transition-colors"
            >
              Scan Your Site Free
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-primary text-primary rounded-lg text-lg font-semibold hover:bg-primary-light no-underline min-h-[48px] transition-colors"
            >
              See How It Works
            </a>
          </div>
          {/* Trust bar */}
          <div className="mt-16 border-t border-border pt-8">
            <p className="text-text-secondary text-sm font-medium mb-4">
              Trusted by forward-thinking businesses
            </p>
            <div className="flex items-center justify-center gap-8 flex-wrap opacity-40">
              <div className="h-8 w-24 bg-gray-300 rounded" role="img" aria-label="Client logo placeholder" />
              <div className="h-8 w-24 bg-gray-300 rounded" role="img" aria-label="Client logo placeholder" />
              <div className="h-8 w-24 bg-gray-300 rounded" role="img" aria-label="Client logo placeholder" />
              <div className="h-8 w-24 bg-gray-300 rounded" role="img" aria-label="Client logo placeholder" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ THE PROBLEM ============ */}
      <section
        aria-labelledby="problem-heading"
        className="bg-surface py-20 sm:py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2
                id="problem-heading"
                className="text-3xl sm:text-4xl font-bold text-text"
              >
                Overlays don&rsquo;t work. The data proves it.
              </h2>
              <p className="mt-4 text-text-secondary text-lg">
                Accessibility overlays add a JavaScript widget that paints over
                broken HTML. They don&rsquo;t fix the underlying code&nbsp;&mdash;
                and courts, regulators, and advocacy groups have noticed.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { stat: '5,000+', label: 'ADA lawsuits filed in 2025' },
                { stat: '25%', label: 'targeted sites using overlays' },
                { stat: '$1M', label: 'FTC fine against accessiBe' },
                { stat: '46%', label: 'of defendants were sued again' },
              ].map(({ stat, label }) => (
                <div
                  key={label}
                  className="bg-white border border-border rounded-xl p-6 text-center"
                >
                  <p className="text-4xl font-extrabold text-primary">{stat}</p>
                  <p className="mt-2 text-text-secondary text-sm">{label}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ============ TWO PRODUCTS ============ */}
      <section
        id="products"
        aria-labelledby="products-heading"
        className="bg-white py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2
              id="products-heading"
              className="text-3xl sm:text-4xl font-bold text-text text-center mb-4"
            >
              Two products. One mission.
            </h2>
            <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-16">
              Tirani fixes websites for owners. AIDA helps disabled users navigate
              any site. Together, they make the web accessible from both sides.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tirani */}
            <FadeInSection>
              <div className="border-2 border-primary rounded-2xl p-8 sm:p-10 h-full">
                <div className="inline-block bg-primary-light text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  For website owners
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">Tirani</h3>
                <p className="text-text-secondary text-lg mb-6">
                  Scans your site. Fixes your source code. Documents everything.
                </p>
                <ul className="space-y-3 text-text-secondary" role="list">
                  {[
                    'Source-code fixes, not overlay patches',
                    'Detailed reports with specific infractions and remediation steps',
                    'Auto-generates accessibility page when site becomes compliant',
                    'Auto-generated VPAT documentation',
                    'Court-defensible audit trail',
                    'Continuous monitoring with regression alerts',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-success mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>

            {/* AIDA */}
            <FadeInSection>
              <div className="border-2 border-border rounded-2xl p-8 sm:p-10 h-full">
                <div className="inline-block bg-primary-light text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  For disabled users
                </div>
                <h3 className="text-2xl font-bold text-text mb-2">AIDA</h3>
                <p className="text-text-secondary text-lg mb-6">
                  Accessible Inclusive Digital Assistant — your guide to any website.
                </p>
                <ul className="space-y-3 text-text-secondary" role="list">
                  {[
                    'Context-aware page scanning with smart shortcuts',
                    'Accessibility scan with actionable remediation',
                    'Barrier reporting — users tell you what\'s broken',
                    'Display preferences: contrast, font size, dyslexia fonts',
                    'Keyboard navigation guide and OS settings help',
                    'Works WITH assistive technology, never against it',
                    'Included free with all Tirani plans',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-success mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="how-it-works"
        aria-labelledby="how-heading"
        className="bg-surface py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2
              id="how-heading"
              className="text-3xl sm:text-4xl font-bold text-text text-center mb-16"
            >
              How it works
            </h2>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              {
                step: '1',
                title: 'Scan',
                desc: 'Enter your URL and get a detailed accessibility report in seconds. Tirani tests against every WCAG 2.2 success criterion and lists each infraction with specific remediation steps.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Fix',
                desc: 'Tirani generates source-code patches for every issue found. Apply them directly or export for your dev team. Once compliant, an accessibility statement page is auto-generated.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.3-3.06a1.5 1.5 0 010-2.59l5.3-3.06a1.5 1.5 0 012.16 1.3v6.12a1.5 1.5 0 01-2.16 1.29zM20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Deploy AIDA',
                desc: 'Add one script tag to your site. AIDA gives your users page navigation, accessibility scanning, barrier reporting, and display preferences — all without modifying your code.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                step: '4',
                title: 'Monitor',
                desc: 'Daily scans catch regressions before plaintiffs do. Barrier reports from real users flow into your dashboard. Get alerts the moment new issues appear.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <FadeInSection key={step}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {icon}
                  </div>
                  <div className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">
                    Step {step}
                  </div>
                  <h3 className="text-xl font-bold text-text mb-3">{title}</h3>
                  <p className="text-text-secondary">{desc}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      <section
        id="compare"
        aria-labelledby="compare-heading"
        className="bg-white py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2
              id="compare-heading"
              className="text-3xl sm:text-4xl font-bold text-text text-center mb-4"
            >
              See how we compare
            </h2>
            <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-12">
              Adibilis is the only platform that fixes your source code AND
              remains affordable.
            </p>
          </FadeInSection>

          <FadeInSection>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left" role="table">
                <caption className="sr-only">
                  Comparison of accessibility solutions
                </caption>
                <thead>
                  <tr className="border-b-2 border-border">
                    <th scope="col" className="py-4 px-4 text-text font-semibold text-sm">
                      Feature
                    </th>
                    <th scope="col" className="py-4 px-4 text-primary font-bold text-sm bg-primary-light rounded-t-lg">
                      Adibilis
                    </th>
                    <th scope="col" className="py-4 px-4 text-text-secondary font-semibold text-sm">
                      accessiBe
                    </th>
                    <th scope="col" className="py-4 px-4 text-text-secondary font-semibold text-sm">
                      AudioEye
                    </th>
                    <th scope="col" className="py-4 px-4 text-text-secondary font-semibold text-sm">
                      Manual Audit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      feature: 'Fixes source code',
                      values: [true, false, false, true],
                    },
                    {
                      feature: 'VPAT generation',
                      values: [true, false, true, true],
                    },
                    {
                      feature: 'Court-defensible audit trail',
                      values: [true, false, false, true],
                    },
                    {
                      feature: 'Works with screen readers',
                      values: [true, false, false, true],
                    },
                    {
                      feature: 'Continuous monitoring',
                      values: [true, true, true, false],
                    },
                    {
                      feature: 'Affordable pricing',
                      values: [true, true, true, false],
                    },
                  ].map(({ feature, values }) => (
                    <tr key={feature} className="border-b border-border">
                      <td className="py-3 px-4 text-text text-sm font-medium">
                        {feature}
                      </td>
                      {values.map((val, i) => (
                        <td
                          key={i}
                          className={`py-3 px-4 text-center ${i === 0 ? 'bg-primary-light' : ''}`}
                        >
                          {val ? (
                            <span className="text-success" aria-label="Yes">
                              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-error" aria-label="No">
                              <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="border-b border-border">
                    <td className="py-3 px-4 text-text text-sm font-medium">
                      Starting price
                    </td>
                    <td className="py-3 px-4 text-center bg-primary-light font-bold text-primary text-sm">
                      $9/mo
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary text-sm">
                      $49/mo
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary text-sm">
                      $49/mo
                    </td>
                    <td className="py-3 px-4 text-center text-text-secondary text-sm">
                      $5,000+
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section
        id="pricing"
        aria-labelledby="pricing-heading"
        className="bg-surface py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2
              id="pricing-heading"
              className="text-3xl sm:text-4xl font-bold text-text text-center mb-4"
            >
              Simple, transparent pricing
            </h2>
            <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-4">
              Every plan includes AIDA. Start free, upgrade when you&rsquo;re ready.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <span
                className={`text-sm font-medium ${!annualBilling ? 'text-text' : 'text-text-secondary'}`}
              >
                Monthly
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={annualBilling}
                aria-label="Toggle annual billing"
                onClick={() => setAnnualBilling(!annualBilling)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full border-none cursor-pointer transition-colors ${
                  annualBilling ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    annualBilling ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium ${annualBilling ? 'text-text' : 'text-text-secondary'}`}
              >
                Annual{' '}
                <span className="text-success font-semibold">(save 20%)</span>
              </span>
            </div>

            {/* Overlay switcher offer */}
            <p className="text-center text-sm text-primary font-semibold mb-12">
              Switching from an overlay? First 3 months free.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Free',
                price: 0,
                desc: 'One-time scan to see your score',
                features: ['1 scan', 'Accessibility score', 'Issue breakdown'],
                cta: 'Get Started',
                popular: false,
              },
              {
                name: 'Personal',
                price: annualBilling ? 7 : 9,
                desc: 'For personal sites and small projects',
                features: [
                  '1 site, 50 pages',
                  'Weekly scans',
                  'Source-code fixes',
                  'AIDA included',
                ],
                cta: 'Start Free Trial',
                popular: false,
              },
              {
                name: 'Business',
                price: annualBilling ? 12 : 15,
                desc: 'For businesses that need compliance',
                features: [
                  '1 site, 500 pages',
                  'Daily scans',
                  'Source-code fixes',
                  'VPAT generation',
                  'Audit trail',
                  'Barrier reports dashboard',
                  'AIDA included',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: -1,
                desc: 'Custom solutions at scale',
                features: [
                  'Unlimited sites',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantees',
                  'AIDA included',
                ],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan) => (
              <FadeInSection key={plan.name}>
                <div
                  className={`rounded-2xl p-6 h-full flex flex-col ${
                    plan.popular
                      ? 'border-2 border-primary bg-white ring-2 ring-primary/20'
                      : 'border border-border bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="text-xs font-bold text-white bg-primary rounded-full px-3 py-1 self-start mb-3">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-text">{plan.name}</h3>
                  <div className="mt-2 mb-1">
                    {plan.price === -1 ? (
                      <span className="text-3xl font-extrabold text-text">Custom</span>
                    ) : plan.price === 0 ? (
                      <span className="text-3xl font-extrabold text-text">$0</span>
                    ) : (
                      <>
                        <span className="text-3xl font-extrabold text-text">
                          ${plan.price}
                        </span>
                        <span className="text-text-secondary text-sm">/mo</span>
                      </>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm mb-6">{plan.desc}</p>
                  <ul className="space-y-2 mb-6 flex-1" role="list">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                        <svg
                          className="w-4 h-4 text-success mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#scan"
                    className={`block text-center py-3 px-4 rounded-lg font-semibold text-sm no-underline min-h-[44px] flex items-center justify-center transition-colors ${
                      plan.popular
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'border-2 border-primary text-primary hover:bg-primary-light'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SOCIAL PROOF / RESULTS ============ */}
      <section
        id="results"
        aria-labelledby="results-heading"
        className="bg-white py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <h2
              id="results-heading"
              className="text-3xl sm:text-4xl font-bold text-text text-center mb-4"
            >
              Your overlay is a liability. We&rsquo;re the fix.
            </h2>
            <p className="text-text-secondary text-lg text-center max-w-2xl mx-auto mb-16">
              Every overlay lawsuit starts the same way: broken HTML hidden behind a widget.
              Adibilis eliminates the root cause.
            </p>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FadeInSection>
              <div className="text-center p-6">
                <p className="text-5xl font-extrabold text-primary mb-2">100%</p>
                <p className="text-text-secondary">Source-code fixes. Zero overlay patches.</p>
              </div>
            </FadeInSection>
            <FadeInSection>
              <div className="text-center p-6">
                <p className="text-5xl font-extrabold text-primary mb-2">1 tag</p>
                <p className="text-text-secondary">Add one script tag. AIDA deploys instantly across your entire site.</p>
              </div>
            </FadeInSection>
            <FadeInSection>
              <div className="text-center p-6">
                <p className="text-5xl font-extrabold text-primary mb-2">24/7</p>
                <p className="text-text-secondary">Real users report real barriers. You fix them before lawyers find them.</p>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ============ SCAN CTA ============ */}
      <section
        id="scan"
        aria-labelledby="scan-heading"
        className="bg-primary py-20 sm:py-24"
        tabIndex={-1}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInSection>
            <h2
              id="scan-heading"
              className="text-3xl sm:text-4xl font-bold text-white mb-4"
            >
              Scan your site in 30 seconds
            </h2>
            <p className="text-blue-100 text-lg mb-10">
              See what your overlay missed. No credit card required.
            </p>

            <form
              onSubmit={handleScanSubmit}
              className="flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto"
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
                className="flex-1 px-4 py-3 rounded-lg text-text border-2 border-white/30 text-lg min-h-[48px] bg-white"
                aria-describedby="scan-help"
              />
              <button
                type="submit"
                disabled={scanState === 'scanning'}
                className="px-8 py-3 bg-white text-primary font-bold rounded-lg text-lg hover:bg-blue-50 border-none cursor-pointer min-h-[48px] transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {scanState === 'scanning' ? 'Scanning...' : 'Scan Now'}
              </button>
            </form>
            {scanState === 'idle' && (
              <p id="scan-help" className="text-blue-200 text-sm mt-3">
                We&rsquo;ll scan your homepage and generate a free accessibility
                report.
              </p>
            )}
            {scanState === 'done' && scanResult && (
              <div className="mt-6 bg-white/10 backdrop-blur rounded-xl p-6 max-w-xl mx-auto text-left">
                <p className="text-white text-lg font-bold mb-2">
                  {scanResult.passRate}% Pass Rate
                </p>
                <p className="text-blue-100 text-sm">
                  Found {scanResult.violations} issue{scanResult.violations !== 1 ? 's' : ''} on {scanResult.url}
                </p>
                <p className="text-blue-200 text-sm mt-3">
                  Sign up for a full report with specific fixes for every issue.
                </p>
              </div>
            )}
            {scanState === 'error' && (
              <p className="text-red-200 text-sm mt-3">
                Something went wrong. Please check the URL and try again.
              </p>
            )}
          </FadeInSection>
        </div>
      </section>
    </main>
  )
}
