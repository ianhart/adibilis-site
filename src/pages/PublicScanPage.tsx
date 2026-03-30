import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import FadeInSection from '../components/FadeInSection'
import { fetchPublicScan, type PublicScanResponse, type ScanFindingPreview } from '../lib/publicScan'

const POLL_INTERVAL_MS = 2500

function getSeverityTheme(severity: ScanFindingPreview['severity']) {
  switch (severity?.code) {
    case 'critical':
      return {
        badge: 'border border-[#7f1d1d] bg-[#9f1239] text-white',
        card: 'border-[#f3c3c3] bg-[#fff7f6]',
        accent: 'bg-[#8a1538]',
        chip: 'border-[#f3c3c3] bg-[#fff7f6] text-[#8a1538]',
      }
    case 'serious':
      return {
        badge: 'border border-[#9a3412] bg-[#c2410c] text-white',
        card: 'border-[#f2cfbb] bg-[#fff8f1]',
        accent: 'bg-[#c2410c]',
        chip: 'border-[#f2cfbb] bg-[#fff8f1] text-[#9a3412]',
      }
    case 'moderate':
      return {
        badge: 'border border-[#b98a2b] bg-[#fff3cf] text-[#7a5313]',
        card: 'border-[#ead9a9] bg-[#fffdf4]',
        accent: 'bg-[#d7a83c]',
        chip: 'border-[#ead9a9] bg-[#fffdf4] text-[#7a5313]',
      }
    default:
      return {
        badge: 'border border-[#7c9a82] bg-[#edf5ee] text-[#304236]',
        card: 'border-[#d7e0d8] bg-[#fbfdfb]',
        accent: 'bg-[#4a6a50]',
        chip: 'border-[#d7e0d8] bg-[#fbfdfb] text-[#304236]',
      }
  }
}

function formatDate(value?: string | null) {
  if (!value) {
    return null
  }

  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes === 0) {
    return `${remainingSeconds}s`
  }

  return `${minutes}m ${remainingSeconds}s`
}

function formatViewport(value?: string | null) {
  if (!value) {
    return 'Any viewport'
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatModeLabel(value?: string | null) {
  if (!value) {
    return 'guided'
  }

  return value.replace(/-/g, ' ')
}

function shortenText(value?: string | null, limit = 120) {
  if (!value) {
    return null
  }

  if (value.length <= limit) {
    return value
  }

  return `${value.slice(0, limit).trimEnd()}...`
}

function ColorSwatch({ color }: { color: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#dccdbd] bg-white px-3 py-1.5 text-xs font-medium text-text">
      <span
        className="h-3 w-3 rounded-full border border-black/10"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {color}
    </span>
  )
}

function DetailTile({
  label,
  value,
  children,
}: {
  label: string
  value?: string | null
  children?: ReactNode
}) {
  if (!value && !children) {
    return null
  }

  return (
    <div className="rounded-[18px] border border-[#e3d6ca] bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      {children ? (
        <div className="mt-2">{children}</div>
      ) : (
        <p className="mt-2 text-sm font-semibold text-text">{value}</p>
      )}
    </div>
  )
}

function CodeBlock({
  label,
  code,
  language = 'html',
}: {
  label: string
  code?: string | null
  language?: string
}) {
  if (!code) {
    return null
  }

  return (
    <div className="rounded-[18px] border border-[#e3d6ca] bg-[#f8f4ee] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{label}</p>
      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-[14px] bg-[#2a322d] p-4 text-xs leading-6 text-[#f6efe6]">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

function ToggleIcon({ expanded }: { expanded: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`text-base leading-none transition-transform ${expanded ? 'rotate-180' : ''}`}
    >
      ▾
    </span>
  )
}

function SeverityBreakdown({ scanResult }: { scanResult: PublicScanResponse }) {
  const levels = [
    { key: 'critical', label: 'Critical', count: scanResult.violationsByImpact?.critical ?? 0, severity: { code: 'critical', label: 'Critical / Roadblock', priority: 0, definition: '' } },
    { key: 'serious', label: 'High', count: scanResult.violationsByImpact?.serious ?? 0, severity: { code: 'serious', label: 'High Severity', priority: 1, definition: '' } },
    { key: 'moderate', label: 'Medium', count: scanResult.violationsByImpact?.moderate ?? 0, severity: { code: 'moderate', label: 'Medium Severity', priority: 2, definition: '' } },
    { key: 'minor', label: 'Low', count: scanResult.violationsByImpact?.minor ?? 0, severity: { code: 'minor', label: 'Low Severity', priority: 3, definition: '' } },
  ]

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {levels.map((level) => {
        const theme = getSeverityTheme(level.severity)
        return (
          <div
            key={level.key}
            className={`inline-flex min-w-[9rem] items-center justify-between gap-4 rounded-full border px-4 py-2 ${theme.chip}`}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">{level.label}</span>
            <span className="font-display text-xl font-semibold">{level.count}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function PublicScanPage() {
  const { scanId } = useParams<{ scanId: string }>()
  const isMissingScanId = !scanId
  const [scanResult, setScanResult] = useState<PublicScanResponse | null>(null)
  const [pageError, setPageError] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [shareCopied, setShareCopied] = useState(false)
  const [findingExpansion, setFindingExpansion] = useState<{
    scanId: string | null
    ids: string[] | null
  }>({
    scanId: null,
    ids: null,
  })

  useEffect(() => {
    if (isMissingScanId) {
      return
    }

    let isCancelled = false
    let pollTimeout: number | undefined

    const poll = async () => {
      try {
        const nextResult = await fetchPublicScan(scanId)

        if (isCancelled) {
          return
        }

        setScanResult(nextResult)
        setPageError(
          nextResult.status === 'failed'
            ? nextResult.errorMessage || 'This scan failed before the results were ready.'
            : null,
        )

        if (nextResult.status === 'queued' || nextResult.status === 'running') {
          pollTimeout = window.setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (error) {
        if (isCancelled) {
          return
        }

        setPageError(
          error instanceof Error ? error.message : 'Unable to load this scan right now.',
        )
      }
    }

    void poll()

    return () => {
      isCancelled = true
      if (pollTimeout) {
        window.clearTimeout(pollTimeout)
      }
    }
  }, [isMissingScanId, scanId])

  const displayError = isMissingScanId ? 'Scan not found.' : pageError
  const isLoading = !scanResult && !displayError
  const isRunning = isLoading || scanResult?.status === 'queued' || scanResult?.status === 'running'

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning])

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareCopied(true)
      window.setTimeout(() => setShareCopied(false), 2000)
    } catch {
      setShareCopied(false)
    }
  }

  const startedAt = formatDate(scanResult?.createdAt)
  const completedAt = formatDate(scanResult?.completedAt)
  const findingCount = scanResult?.findingsPreview.length ?? 0

  const sortedFindings = useMemo(() => {
    if (!scanResult) {
      return []
    }

    return [...scanResult.findingsPreview].sort((left, right) => {
      const leftPriority = left.severity?.priority ?? 99
      const rightPriority = right.severity?.priority ?? 99

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return left.ruleTitle.localeCompare(right.ruleTitle)
    })
  }, [scanResult])

  const defaultExpandedFindingIds: string[] = []

  const expandedFindingIds =
    findingExpansion.scanId === scanResult?.scanId && findingExpansion.ids
      ? findingExpansion.ids
      : defaultExpandedFindingIds

  const allExpanded =
    sortedFindings.length > 0 && expandedFindingIds.length === sortedFindings.length

  const toggleFinding = (findingId: string) => {
    const currentIds = expandedFindingIds
    const nextIds = currentIds.includes(findingId)
      ? currentIds.filter((id) => id !== findingId)
      : [...currentIds, findingId]

    setFindingExpansion({
      scanId: scanResult?.scanId || null,
      ids: nextIds,
    })
  }

  const expandAllFindings = () => {
    setFindingExpansion({
      scanId: scanResult?.scanId || null,
      ids: sortedFindings.map((finding) => finding.id),
    })
  }

  const collapseAllFindings = () => {
    setFindingExpansion({
      scanId: scanResult?.scanId || null,
      ids: [],
    })
  }

  return (
    <main
      id="main-content"
      role="main"
      className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8efe4_0%,#fbf7f1_34%,#f1e8dd_100%)]"
    >
      <section className="relative overflow-hidden py-14 sm:py-18">
        <div className="absolute inset-0">
          <div className="absolute left-[-5rem] top-10 h-48 w-48 rounded-full bg-[#e4bc83]/45 blur-3xl" />
          <div className="absolute right-[-6rem] top-14 h-64 w-64 rounded-full bg-[#d6e0d0]/55 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#d9c5b8]/55 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInSection>
            <section className="rounded-[34px] border border-[#ddcebf] bg-[#fffaf4]/95 p-6 shadow-[0_24px_70px_rgba(95,78,61,0.08)] sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Free Tirani scan
                  </p>
                  <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                    {isLoading
                      ? 'Opening your live scan page now.'
                      : isRunning
                        ? 'Tirani is scanning your page now.'
                        : scanResult?.status === 'completed'
                          ? 'Your scan result is ready to review.'
                          : 'This scan needs attention.'}
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg leading-8 text-text-secondary">
                    {isLoading
                      ? 'We are connecting this page to the live scan so you can watch the status update automatically.'
                      : isRunning
                        ? 'This page keeps polling automatically, so you can leave it open and watch the result arrive.'
                        : scanResult?.status === 'completed'
                          ? 'This result is saved and shareable. Review each issue, the affected element, and the concrete remediation guidance before deciding whether to fix it manually or create a workspace.'
                          : displayError || 'We could not load this scan result right now.'}
                  </p>
                </div>

                <div className="rounded-[28px] border border-[#dfd0c3] bg-[#f8efe4] p-5 lg:min-w-[19rem]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Shareable result
                  </p>
                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    Save this link or send it to your team. The scan stays attached to this public page.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className="mt-4 inline-flex min-h-[46px] items-center justify-center rounded-full border border-[#d6c6b7] bg-white px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34]"
                  >
                    {shareCopied ? 'Link copied' : 'Copy share link'}
                  </button>
                  {startedAt && (
                    <p className="mt-4 text-xs leading-6 text-text-secondary">Started {startedAt}</p>
                  )}
                  {completedAt && (
                    <p className="text-xs leading-6 text-text-secondary">Completed {completedAt}</p>
                  )}
                </div>
              </div>

              {isRunning && (
                <div
                  className="mt-8 rounded-[30px] border border-[#d9cab8] bg-[#304236] p-6 text-white"
                  aria-live="polite"
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/8">
                        <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#d9c5b8] border-t-white" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          {scanResult?.status === 'queued' ? 'Queued' : 'Scanning'}
                        </p>
                        <p className="mt-2 font-display text-3xl font-semibold">
                          {scanResult?.domain || 'Preparing your scan'}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          Tirani is checking the page, mapping findings to WCAG, and preparing the remediation preview.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                        Elapsed
                      </p>
                      <p className="mt-2 font-display text-4xl font-semibold">
                        {formatElapsed(elapsedSeconds)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        This free scan checks only the pasted URL. Most single-page scans finish
                        quickly, but slow or script-heavy pages can still take longer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {scanResult?.status === 'completed' && (
                <>
                  <div className="mt-8 grid gap-4 lg:grid-cols-4">
                    <div className="rounded-[24px] bg-[#304236] p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f3d5c8]">
                        Pass rate
                      </p>
                      <p className="mt-3 font-display text-4xl font-semibold">
                        {scanResult.passRate ?? 0}%
                      </p>
                      <p className="mt-2 text-sm text-slate-200">
                        Across {scanResult.pagesScanned ?? 0} page
                        {scanResult.pagesScanned === 1 ? '' : 's'} in this public scan.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border bg-[#faf4ec] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Findings
                      </p>
                      <p className="mt-3 font-display text-4xl font-semibold text-text">
                        {scanResult.violationsCount}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Individual issues identified on the scanned page.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border bg-[#faf4ec] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Fix routes
                      </p>
                      <p className="mt-3 font-display text-4xl font-semibold text-text">
                        {scanResult.remediation.totalPatches}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Suggested fix path
                        {scanResult.remediation.totalPatches === 1 ? '' : 's'} prepared.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-border bg-[#faf4ec] p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Platform
                      </p>
                      <p className="mt-3 font-display text-2xl font-semibold capitalize text-text">
                        {scanResult.platform ?? 'custom/static'}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-text-secondary">
                        Mode:{' '}
                        {formatModeLabel(
                          scanResult.remediation.engine?.platformProfile?.implementationMode,
                        )}
                      </p>
                    </div>
                  </div>

                  <SeverityBreakdown scanResult={scanResult} />

                  <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_20rem]">
                    <div className="rounded-[28px] border border-border bg-[#fffdf8] p-5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            Findings and fixes
                          </p>
                          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">
                            Review each issue, where it appears, and how to fix it.
                          </h2>
                        </div>
                        {scanResult.standardsSource && (
                          <span className="rounded-full bg-primary-light px-3 py-2 text-xs font-semibold text-primary">
                            {scanResult.standardsSource.label}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-7 text-text-secondary">
                        This page is designed to be useful on its own. Each result includes the
                        exact element context Tirani found, the WCAG mapping, and the concrete fix
                        guidance currently available from the engine.
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={expandAllFindings}
                          disabled={allExpanded}
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#d9cab8] bg-white px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Expand all
                        </button>
                        <button
                          type="button"
                          onClick={collapseAllFindings}
                          disabled={expandedFindingIds.length === 0}
                          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-[#d9cab8] bg-white px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Collapse all
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4">
                        {sortedFindings.map((finding, index) => {
                          const severityTheme = getSeverityTheme(finding.severity)
                          const hasAffectedElement = Boolean(finding.htmlSnippet)
                          const hasCodeExamples = Boolean(
                            finding.fix?.currentCode || finding.fix?.fixedCode,
                          )
                          const isExpanded = expandedFindingIds.includes(finding.id)
                          const showPageContext = (scanResult?.pagesScanned ?? 0) > 1

                          return (
                            <article
                              key={finding.id}
                              className={`overflow-hidden rounded-[24px] border ${severityTheme.card}`}
                            >
                              <div className={`h-1.5 w-full ${severityTheme.accent}`} />

                              <div className="p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full border border-[#d6c8bb] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a4a34]">
                                        Result {index + 1}
                                      </span>
                                      {finding.severity && (
                                        <span
                                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${severityTheme.badge}`}
                                        >
                                          {finding.severity.label}
                                        </span>
                                      )}
                                      <span className="rounded-full border border-[#d6c8bb] bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                        {formatViewport(finding.viewport)}
                                      </span>
                                    </div>

                                    <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-text">
                                      {finding.ruleTitle}
                                    </h3>

                                    {finding.wcag.length > 0 && (
                                      <p className="mt-2 text-xs leading-6 text-text-secondary">
                                        WCAG{' '}
                                        {finding.wcag
                                          .map((criterion) =>
                                            criterion.name
                                              ? `${criterion.id} ${criterion.name} (${criterion.level})`
                                              : `${criterion.id} (${criterion.level})`,
                                          )
                                          .join(', ')}
                                      </p>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleFinding(finding.id)}
                                    aria-expanded={isExpanded}
                                    className="inline-flex min-h-[42px] items-center justify-center gap-2 self-start rounded-full border border-[#d6c8bb] bg-white px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34]"
                                  >
                                    {isExpanded ? 'Hide details' : 'Show details'}
                                    <ToggleIcon expanded={isExpanded} />
                                  </button>
                                </div>

                                {finding.userImpact && (
                                  <p className="mt-3 text-sm leading-7 text-text-secondary">
                                    {finding.userImpact}
                                  </p>
                                )}

                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                  <DetailTile label="Selector">
                                    {finding.selector ? (
                                      <code className="rounded bg-[#f4ede4] px-1.5 py-1 text-xs text-text">
                                        {finding.selector}
                                      </code>
                                    ) : null}
                                  </DetailTile>
                                  <DetailTile
                                    label="Suggested action"
                                    value={shortenText(
                                      finding.remediationSummary || finding.fix?.explanation,
                                      120,
                                    )}
                                  />
                                </div>

                                {isExpanded && (
                                  <div className="mt-4 space-y-4 border-t border-[#e5d9cd] pt-4">
                                    {finding.severity?.definition && (
                                      <p className="rounded-[16px] border border-[#e4d6c8] bg-white px-4 py-3 text-sm leading-7 text-text-secondary">
                                        <span className="font-semibold text-text">Severity note:</span>{' '}
                                        {finding.severity.definition}
                                      </p>
                                    )}

                                    {finding.diagnostics?.kind === 'color-contrast' && (
                                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                        <DetailTile
                                          label="Current ratio"
                                          value={finding.diagnostics.currentRatio}
                                        />
                                        <DetailTile
                                          label="Required ratio"
                                          value={finding.diagnostics.requiredRatio}
                                        />
                                        <DetailTile
                                          label="Font size"
                                          value={finding.diagnostics.fontSize}
                                        />
                                        <DetailTile
                                          label="Font weight"
                                          value={finding.diagnostics.fontWeight}
                                        />
                                        <DetailTile label="Foreground">
                                          {finding.diagnostics.foregroundColor ? (
                                            <ColorSwatch color={finding.diagnostics.foregroundColor} />
                                          ) : null}
                                        </DetailTile>
                                        <DetailTile label="Background">
                                          {finding.diagnostics.backgroundColor ? (
                                            <ColorSwatch color={finding.diagnostics.backgroundColor} />
                                          ) : null}
                                        </DetailTile>
                                      </div>
                                    )}

                                    <section className="rounded-[20px] border border-[#e3d6ca] bg-[#fffdf8] p-4 lg:p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                      Where Tirani found it
                                    </p>
                                    <div
                                      className={`mt-4 grid gap-4 ${hasAffectedElement ? 'xl:grid-cols-[minmax(0,1fr)_18rem]' : ''}`}
                                    >
                                      <div className="space-y-3 text-sm leading-7 text-text-secondary">
                                        {showPageContext && finding.pageUrl && (
                                          <p>
                                            <span className="font-semibold text-text">Page:</span>{' '}
                                            <a
                                              href={finding.pageUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-primary underline decoration-[#bf5b3d]/30 underline-offset-4 transition-colors hover:text-[#8a4a34]"
                                            >
                                              {finding.pageUrl}
                                            </a>
                                          </p>
                                        )}
                                        {finding.selector && (
                                          <p>
                                            <span className="font-semibold text-text">Selector:</span>{' '}
                                            <code className="rounded bg-[#f4ede4] px-1.5 py-1 text-xs text-text">
                                              {finding.selector}
                                            </code>
                                          </p>
                                        )}
                                        {finding.target.length > 0 && (
                                          <p>
                                            <span className="font-semibold text-text">Target:</span>{' '}
                                            {finding.target.join(', ')}
                                          </p>
                                        )}
                                        {finding.failureSummary && (
                                          <div className="rounded-[16px] bg-[#f8f1e8] p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                              Failure details
                                            </p>
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                                              {finding.failureSummary}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      {finding.htmlSnippet && (
                                        <div className="rounded-[18px] border border-[#e3d6ca] bg-[#fbf7f1] p-3">
                                          <CodeBlock
                                            label="Affected element"
                                            code={finding.htmlSnippet}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </section>

                                    <section className="rounded-[20px] border border-[#e3d6ca] bg-[#fffdf8] p-4 lg:p-5">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                      How to fix it
                                    </p>
                                    <div
                                      className={`mt-4 grid gap-4 ${hasCodeExamples ? 'xl:grid-cols-[minmax(0,1fr)_22rem]' : ''}`}
                                    >
                                      <div className="space-y-3">
                                        {finding.remediationSummary && (
                                          <p className="text-sm leading-7 text-text">
                                            {finding.remediationSummary}
                                          </p>
                                        )}

                                        {finding.fix?.explanation && (
                                          <div className="rounded-[16px] bg-[#f8f1e8] p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                              Concrete guidance
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                              {finding.fix.explanation}
                                            </p>
                                          </div>
                                        )}

                                        {finding.fix?.platformInstructions?.length ? (
                                          <div className="rounded-[16px] bg-[#f8f1e8] p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                              Platform notes
                                            </p>
                                            <ul className="mt-2 space-y-2 pl-5 text-sm leading-7 text-text-secondary">
                                              {finding.fix.platformInstructions.map((instruction) => (
                                                <li key={instruction}>{instruction}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        ) : null}

                                        {(finding.fix?.verificationSummary ||
                                          finding.verificationSummary ||
                                          finding.fix?.verificationSteps?.length) && (
                                          <div className="rounded-[16px] bg-[#f8f1e8] p-3">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                                              Verify after the fix
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                              {finding.fix?.verificationSummary || finding.verificationSummary}
                                            </p>
                                            {finding.fix?.verificationSteps?.length ? (
                                              <ul className="mt-3 space-y-2 pl-5 text-sm leading-7 text-text-secondary">
                                                {finding.fix.verificationSteps.map((step) => (
                                                  <li key={step}>{step}</li>
                                                ))}
                                              </ul>
                                            ) : null}
                                          </div>
                                        )}

                                        {(finding.fix?.helpUrl || finding.helpUrl) && (
                                          <a
                                            href={finding.fix?.helpUrl || finding.helpUrl || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-[42px] items-center justify-center rounded-full border border-[#d9cab8] bg-white px-4 py-2 text-sm font-semibold text-text no-underline transition-colors hover:border-[#bf5b3d] hover:text-[#8a4a34]"
                                          >
                                            Read rule guidance
                                          </a>
                                        )}
                                      </div>

                                      {hasCodeExamples && (
                                        <div className="grid content-start gap-3">
                                          <CodeBlock
                                            label="Current code"
                                            code={finding.fix?.currentCode}
                                            language={finding.ruleId === 'color-contrast' ? 'css' : 'html'}
                                          />
                                          <CodeBlock
                                            label="Suggested change"
                                            code={finding.fix?.fixedCode}
                                            language={finding.ruleId === 'color-contrast' ? 'css' : 'html'}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    </section>
                                  </div>
                                )}
                              </div>
                            </article>
                          )
                        })}
                      </div>
                    </div>

                    <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
                      <section className="rounded-[28px] border border-border bg-[#faf4ec] p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                          Remediation path
                        </p>
                        <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">
                          How to use this result
                        </h2>
                        <div className="mt-5 space-y-4">
                          <div className="rounded-[22px] bg-[#fffdf8] p-4">
                            <p className="text-sm font-semibold text-text">
                              {findingCount} finding{findingCount === 1 ? '' : 's'} listed here with
                              live element context
                            </p>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                              Start with the highest-severity items, fix one element at a time, then
                              re-run the page scan to confirm the issue is gone.
                            </p>
                          </div>
                          <div className="rounded-[22px] bg-[#fffdf8] p-4">
                            <p className="text-sm font-semibold text-text">
                              {scanResult.remediation.manualReviewCount} item
                              {scanResult.remediation.manualReviewCount === 1 ? '' : 's'} still need
                              human verification
                            </p>
                            <p className="mt-2 text-sm leading-6 text-text-secondary">
                              {scanResult.automationDisclosure ||
                                'Automated scanning identifies likely issues, but manual verification is still required.'}
                            </p>
                          </div>
                          {scanResult.platformDetection?.evidence.length ? (
                            <div className="rounded-[22px] bg-[#fffdf8] p-4">
                              <p className="text-sm font-semibold text-text">Platform evidence</p>
                              <p className="mt-2 text-sm leading-6 text-text-secondary">
                                {scanResult.platformDetection.evidence.slice(0, 3).join(', ')}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </section>

                      <section className="rounded-[28px] border border-[#304236]/20 bg-[#304236] p-6 text-white shadow-[0_24px_70px_rgba(58,47,39,0.18)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c8b8]">
                          Next step
                        </p>
                        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                          We can do this automatically.
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-slate-200">
                          Create a workspace to save this scan, unlock the full Tirani remediation
                          workflow, install AIDA, and keep monitoring the site over time.
                        </p>
                        <div className="mt-6 flex flex-col gap-3">
                          <Link
                            to="/signup"
                            className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#bf5b3d] px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a44c32]"
                          >
                            Create free account
                          </Link>
                          <Link
                            to="/login"
                            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:border-white/30"
                          >
                            Log in
                          </Link>
                        </div>
                      </section>
                    </div>
                  </div>
                </>
              )}

              {scanResult?.status === 'failed' && (
                <div className="mt-8 rounded-[28px] border border-[#e1cfc3] bg-[#f8eee8] p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Scan failed
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text">
                    This scan did not complete cleanly.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-text-secondary">
                    {pageError ||
                      displayError ||
                      'The page may have blocked the scan or returned an unexpected response.'}
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to="/"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
                    >
                      Try another scan
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-text no-underline transition-colors hover:border-primary hover:text-primary"
                    >
                      Create workspace instead
                    </Link>
                  </div>
                </div>
              )}

              {!scanResult && displayError && (
                <div className="mt-8 rounded-[28px] border border-[#e1cfc3] bg-[#f8eee8] p-6">
                  <p className="text-sm leading-7 text-text-secondary">{displayError}</p>
                  <div className="mt-5">
                    <Link
                      to="/"
                      className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
                    >
                      Back to home
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </FadeInSection>
        </div>
      </section>
    </main>
  )
}
