import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest, buildApiUrl } from '../lib/api'

interface ScanSeverity {
  code: string
  label: string
}

interface WcagCriterion {
  id: string
  level: string
}

interface FindingFix {
  selector: string | null
  explanation: string | null
  currentCode: string | null
  fixedCode: string | null
  platformInstructions: string[]
  verificationSummary: string | null
  humanReviewRequired: boolean
  implementationMode: string | null
  helpUrl: string | null
}

interface FindingDiagnostics {
  kind: string
  currentRatio: string | null
  requiredRatio: string | null
  foregroundColor: string | null
  backgroundColor: string | null
}

interface Finding {
  id: string
  ruleId: string
  ruleTitle: string
  severity: ScanSeverity | null
  wcag: WcagCriterion[]
  pageUrl: string | null
  selector: string | null
  help: string | null
  helpUrl: string | null
  userImpact: string | null
  htmlSnippet: string | null
  failureSummary: string | null
  diagnostics: FindingDiagnostics | null
  remediationSummary: string | null
  fix: FindingFix | null
}

interface RemediationPreview {
  ruleId: string
  ruleTitle: string
  impact: string
  userImpact: string | null
  implementationMode: string | null
  directPatchSupport: string | null
  humanReviewRequired: boolean
  platformInstructions: string[]
}

interface ScanDetailResponse {
  scanId: string
  siteId: string
  status: string
  url: string | null
  domain: string | null
  platform: string | null
  passRate: number | null
  pagesScanned: number | null
  violationsCount: number
  violationsByImpact: {
    critical: number
    serious: number
    moderate: number
    minor: number
  }
  findingsPreview: Finding[]
  remediation: {
    available: boolean
    totalPatches: number
    ruleCount: number
    manualReviewCount: number
    preview: RemediationPreview[]
    engine?: {
      platformProfile?: {
        implementationMode: string
        directPatchSupport: string
      } | null
    } | null
  }
  artifacts: {
    reportAvailable: boolean
    reportPath: string | null
    fixesAvailable: boolean
    fixesPath: string | null
    vpatAvailable: boolean
    vpatPath: string | null
  }
  automationDisclosure: string | null
  errorMessage: string | null
  createdAt: string
  completedAt: string | null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  serious: 'bg-orange-100 text-orange-800 border-orange-200',
  moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  minor: 'bg-blue-100 text-blue-700 border-blue-200',
}

function SeverityBadge({ severity }: { severity: ScanSeverity | null }) {
  if (!severity) return null
  const style = SEVERITY_STYLES[severity.code] || SEVERITY_STYLES.minor
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${style}`}>
      {severity.label}
    </span>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? 'text-primary' : 'text-text'}`}>{value}</p>
    </div>
  )
}

function CodeBlock({ label, code }: { label: string; code: string | null }) {
  if (!code) return null
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
      <pre className="overflow-x-auto rounded-xl bg-[#0f172a] p-3 text-xs leading-6 text-slate-200">
        {code}
      </pre>
    </div>
  )
}

function FindingCard({ finding, defaultExpanded }: { finding: Finding; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false)
  const hasFix = finding.fix !== null

  return (
    <article className={`rounded-2xl border p-5 transition-colors ${hasFix ? 'border-emerald-200 bg-emerald-50/40' : 'border-border bg-white'}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            {hasFix && (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                Fixed
              </span>
            )}
            {finding.fix?.humanReviewRequired && (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                Needs review
              </span>
            )}
          </div>
          <h4 className="mt-2 text-sm font-semibold text-text">{finding.ruleTitle}</h4>
          {finding.wcag.length > 0 && (
            <p className="mt-1 text-xs text-text-secondary">
              WCAG {finding.wcag.map((c) => `${c.id} (${c.level})`).join(', ')}
            </p>
          )}
        </div>
        <span className="mt-1 flex-shrink-0 text-lg text-text-secondary" aria-hidden="true">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
          {finding.pageUrl && (
            <p className="text-xs text-text-secondary">
              <span className="font-semibold">Page:</span> {finding.pageUrl}
            </p>
          )}

          {finding.selector && (
            <p className="text-xs font-mono text-text-secondary">
              <span className="font-sans font-semibold">Selector:</span> {finding.selector}
            </p>
          )}

          {finding.userImpact && (
            <div className="rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">User impact</p>
              <p className="mt-1 text-sm text-text">{finding.userImpact}</p>
            </div>
          )}

          {finding.failureSummary && (
            <div className="rounded-xl bg-surface p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">What failed</p>
              <p className="mt-1 text-sm text-text-secondary">{finding.failureSummary}</p>
            </div>
          )}

          {finding.htmlSnippet && (
            <CodeBlock label="Element HTML" code={finding.htmlSnippet} />
          )}

          {finding.diagnostics?.kind === 'color-contrast' && (
            <div className="grid gap-3 sm:grid-cols-2">
              {finding.diagnostics.foregroundColor && finding.diagnostics.backgroundColor && (
                <div className="flex items-center gap-3 rounded-xl bg-surface p-3">
                  <div
                    className="h-8 w-8 rounded border border-border"
                    style={{ backgroundColor: finding.diagnostics.foregroundColor }}
                    title={`Foreground: ${finding.diagnostics.foregroundColor}`}
                  />
                  <div
                    className="h-8 w-8 rounded border border-border"
                    style={{ backgroundColor: finding.diagnostics.backgroundColor }}
                    title={`Background: ${finding.diagnostics.backgroundColor}`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-text">
                      {finding.diagnostics.currentRatio} contrast
                    </p>
                    <p className="text-xs text-text-secondary">
                      Required: {finding.diagnostics.requiredRatio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {hasFix && finding.fix && (
            <div className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Remediation</p>
              {finding.fix.explanation && (
                <p className="text-sm text-text">{finding.fix.explanation}</p>
              )}
              <div className="grid gap-3 lg:grid-cols-2">
                <CodeBlock label="Before" code={finding.fix.currentCode} />
                <CodeBlock label="After" code={finding.fix.fixedCode} />
              </div>
              {finding.fix.platformInstructions.length > 0 && (
                <div className="rounded-xl bg-white/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Steps</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-sm text-text-secondary">
                    {finding.fix.platformInstructions.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {finding.fix.verificationSummary && (
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold">Verify:</span> {finding.fix.verificationSummary}
                </p>
              )}
            </div>
          )}

          {finding.helpUrl && (
            <a
              href={finding.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-xs font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
            >
              Learn more about this rule
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export default function ScanDetailPage() {
  const { scanId } = useParams<{ scanId: string }>()
  const { token } = useAuth()
  const [scan, setScan] = useState<ScanDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !scanId) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    apiRequest<ScanDetailResponse>(`/scans/${scanId}`, { token })
      .then((data) => {
        if (!cancelled) setScan(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unable to load scan')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [token, scanId])

  async function openArtifact(path: string | null) {
    if (!token || !path) return
    try {
      const response = await fetch(buildApiUrl(path), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error('Unable to open artifact')
      const contentType = response.headers.get('content-type') || 'text/plain'
      const body = await response.text()
      const blob = new Blob([body], { type: contentType })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('Unable to open artifact')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[32px] border border-border bg-white p-8 text-sm text-text-secondary">
          Loading scan details...
        </div>
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {error || 'Scan not found'}
        </div>
        <Link to="/app" className="text-sm font-semibold text-primary underline underline-offset-2">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const findings = scan.findingsPreview || []
  const fixedCount = findings.filter((f) => f.fix !== null).length
  const unfixedCount = findings.length - fixedCount

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/app"
          className="rounded-2xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary no-underline"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text">Scan details</h1>
      </div>

      <section className="rounded-[32px] bg-white p-6 shadow-sm border border-border">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {scan.domain || 'Site scan'}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-text">
              {scan.status === 'completed'
                ? `${scan.passRate ?? 0}% pass rate`
                : scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {formatDate(scan.createdAt)}
              {scan.completedAt ? ` — completed ${formatDate(scan.completedAt)}` : ''}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {scan.platform && (
              <span className="rounded-full bg-primary-light px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                {scan.platform}
              </span>
            )}
            <span className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
              scan.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : scan.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
            }`}>
              {scan.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Pages scanned" value={scan.pagesScanned ?? 0} />
          <StatCard label="Total violations" value={scan.violationsCount} />
          <StatCard label="Fixes generated" value={scan.remediation.totalPatches} accent />
          <StatCard label="Manual review" value={scan.remediation.manualReviewCount} />
          <StatCard label="Pass rate" value={`${scan.passRate ?? 0}%`} accent />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            <span className="text-xs font-semibold text-red-800">Critical: {scan.violationsByImpact.critical}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
            <span className="text-xs font-semibold text-orange-800">Serious: {scan.violationsByImpact.serious}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-semibold text-amber-800">Moderate: {scan.violationsByImpact.moderate}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-800">Minor: {scan.violationsByImpact.minor}</span>
          </div>
        </div>

        {scan.artifacts.reportAvailable || scan.artifacts.vpatAvailable ? (
          <div className="mt-6 flex flex-wrap gap-3">
            {scan.artifacts.reportAvailable && (
              <button
                type="button"
                onClick={() => void openArtifact(scan.artifacts.reportPath)}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
              >
                Open HTML report
              </button>
            )}
            {scan.artifacts.vpatAvailable && (
              <button
                type="button"
                onClick={() => void openArtifact(scan.artifacts.vpatPath)}
                className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary"
              >
                Open VPAT
              </button>
            )}
          </div>
        ) : null}
      </section>

      {scan.errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {scan.errorMessage}
        </div>
      )}

      <section className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Findings & remediation</p>
        <h3 className="mt-2 text-2xl font-bold text-text">
          {findings.length} violation{findings.length === 1 ? '' : 's'} found
          {fixedCount > 0 && (
            <span className="ml-2 text-lg font-medium text-emerald-600">
              ({fixedCount} fixed, {unfixedCount} remaining)
            </span>
          )}
        </h3>

        <div className="mt-6 space-y-4">
          {findings.length === 0 ? (
            <div className="rounded-2xl bg-emerald-50 p-6 text-center">
              <p className="text-lg font-semibold text-emerald-800">No violations detected</p>
              <p className="mt-1 text-sm text-emerald-600">
                This scan found no WCAG 2.2 AA violations on the scanned pages.
              </p>
            </div>
          ) : (
            findings.map((finding, index) => (
              <FindingCard key={finding.id} finding={finding} defaultExpanded={index === 0} />
            ))
          )}
        </div>
      </section>

      {scan.automationDisclosure && (
        <p className="rounded-2xl bg-surface px-4 py-3 text-xs text-text-secondary">
          {scan.automationDisclosure}
        </p>
      )}
    </div>
  )
}
