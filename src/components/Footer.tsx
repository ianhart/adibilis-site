import { Link } from 'react-router-dom'

const footerGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Scan & fix engine', href: '/#products' },
      { label: 'Live assistant', href: '/#products' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    title: 'Workflow',
    links: [
      { label: 'Free scan', href: '/#scan' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Why Adibilis', href: '/#compare' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#26352c] py-16 text-white" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f0c7b8]">
              Adibilis
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">
              Accessibility remediation that reaches both the codebase and the person using it.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Our Accessibility Scan &amp; Fix Engine, powered by Tirani, routes WCAG-grounded fixes.
              Our Live Accessibility Assistant, powered by AIDA, helps visitors navigate,
              orient, and report barriers.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-lg font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3 list-none p-0">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-300 no-underline transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="font-display text-lg font-semibold text-white">Account</h3>
            <div className="mt-4 space-y-3">
              <Link
                to="/signup"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-[#bf5b3d] px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a44c32]"
              >
                Create workspace
              </Link>
              <div>
                <Link
                  to="/login"
                  className="text-sm text-slate-300 no-underline transition-colors hover:text-white"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>Built with accessible defaults, keyboard support, and strong focus states.</p>
            <p className="mt-1">Selected illustrations are licensed via Freepik for this marketing experience.</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Adibilis. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
