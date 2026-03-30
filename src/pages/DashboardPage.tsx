import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API_BASE_URL, apiRequest, buildApiUrl } from '../lib/api'

type ScanStatus = 'queued' | 'running' | 'completed' | 'failed'

interface SiteSummary {
  id: string
  name: string
  domain: string
  url: string
  platform: string | null
  apiKey: string | null
  barrierCount: number
  latestScan: {
    id: string
    status: ScanStatus
    passRate: number | null
    critical: number
    serious: number
    moderate: number
    minor: number
    createdAt: string
    completedAt: string | null
  } | null
}

interface SiteDetail {
  id: string
  name: string
  domain: string
  url: string
  platform: string | null
  apiKey: string | null
  scans: Array<{
    id: string
    status: ScanStatus
    passRate: number | null
    critical: number
    serious: number
    moderate: number
    minor: number
    pagesScanned: number | null
    createdAt: string
    completedAt: string | null
  }>
}

interface Barrier {
  id: string
  type: string
  description: string
  pageUrl: string
  assistiveTech: string | null
  createdAt: string
}

interface ScanFindingPreview {
  id: string
  ruleId: string
  ruleTitle: string
  severity: {
    code: string
    label: string
  } | null
  wcag: Array<{
    id: string
    level: string
  }>
  userImpact: string | null
  remediationSummary: string | null
}

interface ScanDetail {
  scanId: string
  status: ScanStatus
  platform: string | null
  passRate: number | null
  pagesScanned: number | null
  violationsCount: number
  findingsPreview: ScanFindingPreview[]
  remediation: {
    totalPatches: number
    ruleCount: number
    manualReviewCount: number
    engine?: {
      platformProfile?: {
        implementationMode: string
        directPatchSupport: string
      } | null
    } | null
    preview: Array<{
      ruleId: string
      ruleTitle: string
      impact: string
      userImpact: string | null
      implementationMode: string | null
      directPatchSupport: string | null
      humanReviewRequired: boolean
      platformInstructions: string[]
    }>
  }
  artifacts: {
    reportAvailable: boolean
    reportPath: string | null
    vpatAvailable: boolean
    vpatPath: string | null
  }
  automationDisclosure: string | null
  createdAt: string
  completedAt: string | null
}

interface ScanUsage {
  plan: string
  dailyLimit: number | null
  usedToday: number
  remainingToday: number | null
  resetsAt: string | null
  entitlements: {
    includesAida: boolean
    includesBarrierReports: boolean
    includesPremiumArtifacts: boolean
    dailyScanLimit: number | null
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return 'Not yet'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function fetchWorkspace(token: string, siteId: string) {
  const site = await apiRequest<SiteDetail>(`/sites/${siteId}`, { token })
  const latestScanId = site.scans[0]?.id

  const [barriers, latestScan] = await Promise.all([
    apiRequest<Barrier[]>(`/barriers/site/${siteId}`, { token }),
    latestScanId ? apiRequest<ScanDetail>(`/scans/${latestScanId}`, { token }) : Promise.resolve(null),
  ])

  return {
    site,
    barriers,
    latestScan,
  }
}

async function fetchScanUsage(token: string) {
  return apiRequest<ScanUsage>('/scans/usage', { token })
}

async function openProtectedTextArtifact(token: string, path: string) {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Unable to open artifact')
  }

  const contentType = response.headers.get('content-type') || 'text/plain'
  const body = await response.text()
  const blob = new Blob([body], { type: contentType })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export default function DashboardPage() {
  const { token, user } = useAuth()
  const [sites, setSites] = useState<SiteSummary[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
  const [selectedSite, setSelectedSite] = useState<SiteDetail | null>(null)
  const [latestScan, setLatestScan] = useState<ScanDetail | null>(null)
  const [barriers, setBarriers] = useState<Barrier[]>([])
  const [scanUsage, setScanUsage] = useState<ScanUsage | null>(null)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const [isLoadingSites, setIsLoadingSites] = useState(true)
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false)
  const [isCreatingSite, setIsCreatingSite] = useState(false)
  const [isRunningScan, setIsRunningScan] = useState(false)
  const [scanProgress, setScanProgress] = useState<string | null>(null)
  const [siteName, setSiteName] = useState('')
  const [siteUrl, setSiteUrl] = useState('')

  const loadSites = async (preferredSiteId?: string) => {
    if (!token) {
      return []
    }

    const response = await apiRequest<SiteSummary[]>('/sites', { token })
    setSites(response)

    const nextSiteId =
      preferredSiteId ||
      selectedSiteId ||
      response[0]?.id ||
      null

    setSelectedSiteId(nextSiteId)
    return response
  }

  const loadUsage = async (activeToken = token) => {
    if (!activeToken) {
      return null
    }

    const usage = await fetchScanUsage(activeToken)
    setScanUsage(usage)
    return usage
  }

  useEffect(() => {
    if (!token) {
      return
    }

    const activeToken = token
    let cancelled = false

    async function bootstrap() {
      setIsLoadingSites(true)
      setDashboardError(null)

      try {
        const [response, usage] = await Promise.all([
          apiRequest<SiteSummary[]>('/sites', { token: activeToken }),
          fetchScanUsage(activeToken),
        ])
        if (cancelled) {
          return
        }

        setSites(response)
        setScanUsage(usage)
        setSelectedSiteId((current) => current || response[0]?.id || null)
      } catch (loadError) {
        if (!cancelled) {
          setDashboardError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSites(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setSelectedSite(null)
      setLatestScan(null)
      setBarriers([])
      return
    }

    if (!selectedSiteId) {
      setSelectedSite(null)
      setLatestScan(null)
      setBarriers([])
      return
    }

    const activeToken: string = token
    const activeSiteId: string = selectedSiteId

    let cancelled = false

    async function loadWorkspace() {
      setIsLoadingWorkspace(true)
      setDashboardError(null)

      try {
        const workspace = await fetchWorkspace(activeToken, activeSiteId)
        if (cancelled) {
          return
        }

        setSelectedSite(workspace.site)
        setLatestScan(workspace.latestScan)
        setSelectedScanId(workspace.latestScan?.scanId || null)
        setBarriers(workspace.barriers)
      } catch (workspaceError) {
        if (!cancelled) {
          setDashboardError(
            workspaceError instanceof Error ? workspaceError.message : 'Unable to load site workspace',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingWorkspace(false)
        }
      }
    }

    void loadWorkspace()

    return () => {
      cancelled = true
    }
  }, [selectedSiteId, token])

  const handleCreateSite = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) {
      return
    }

    setIsCreatingSite(true)
    setDashboardError(null)

    try {
      const created = await apiRequest<{ id: string }>('/sites', {
        method: 'POST',
        token,
        json: {
          name: siteName,
          url: siteUrl,
        },
      })

      setSiteName('')
      setSiteUrl('')
      await loadSites(created.id)
      await loadUsage(token)
    } catch (creationError) {
      setDashboardError(creationError instanceof Error ? creationError.message : 'Unable to add site')
    } finally {
      setIsCreatingSite(false)
    }
  }

  const handleRunScan = async () => {
    if (!token || !selectedSiteId) {
      return
    }

    if (user?.plan === 'free' && (scanUsage?.remainingToday ?? 0) <= 0) {
      setDashboardError('Free workspaces include 3 scans per day. Your allowance resets daily.')
      return
    }

    setIsRunningScan(true)
    setScanProgress('Queueing Tirani scan...')
    setDashboardError(null)

    try {
      const queued = await apiRequest<{ scanId: string }>('/scans', {
        method: 'POST',
        token,
        json: { siteId: selectedSiteId },
      })

      const deadline = Date.now() + 90_000

      while (Date.now() < deadline) {
        const scan = await apiRequest<ScanDetail>(`/scans/${queued.scanId}`, { token })
        setLatestScan(scan)
        setScanProgress(
          scan.status === 'queued'
            ? 'Tirani queued your scan...'
            : scan.status === 'running'
              ? 'Tirani is scanning and generating remediation...'
              : scan.status === 'completed'
                ? 'Scan complete.'
                : 'Scan failed.',
        )

        if (scan.status === 'completed' || scan.status === 'failed') {
          break
        }

        await sleep(2_500)
      }

      await loadSites(selectedSiteId)
      await loadUsage(token)
      const workspace = await fetchWorkspace(token, selectedSiteId)
      setSelectedSite(workspace.site)
      setLatestScan(workspace.latestScan)
      setSelectedScanId(workspace.latestScan?.scanId || null)
      setBarriers(workspace.barriers)
    } catch (scanError) {
      setDashboardError(scanError instanceof Error ? scanError.message : 'Unable to run scan')
    } finally {
      setIsRunningScan(false)
    }
  }

  const handleSelectScan = async (scanId: string) => {
    if (!token || scanId === selectedScanId) {
      return
    }

    try {
      setIsLoadingWorkspace(true)
      setSelectedScanId(scanId)
      const scan = await apiRequest<ScanDetail>(`/scans/${scanId}`, { token })
      setLatestScan(scan)
      setDashboardError(null)
    } catch (scanError) {
      setDashboardError(scanError instanceof Error ? scanError.message : 'Unable to load scan details')
    } finally {
      setIsLoadingWorkspace(false)
    }
  }

  const openArtifact = async (path: string | null) => {
    if (!token || !path) {
      return
    }

    try {
      await openProtectedTextArtifact(token, path)
    } catch (artifactError) {
      setDashboardError(artifactError instanceof Error ? artifactError.message : 'Unable to open artifact')
    }
  }

  const totalBarrierCount = sites.reduce((sum, site) => sum + site.barrierCount, 0)
  const isFreePlan = (user?.plan || 'free') === 'free'
  const checklist = isFreePlan
    ? [
        {
          label: 'Account created',
          complete: true,
          detail: user?.email || 'Authenticated',
        },
        {
          label: 'Connect your site',
          complete: sites.length > 0,
          detail: sites.length > 0 ? `${sites.length} site connected` : 'Add your first site',
        },
        {
          label: 'Run today’s scans',
          complete: Boolean(selectedSite?.scans[0]),
          detail:
            scanUsage && scanUsage.dailyLimit !== null
              ? `${scanUsage.remainingToday ?? 0} of ${scanUsage.dailyLimit} scans left today`
              : 'Run your first scan',
        },
        {
          label: 'Review scan history',
          complete: Boolean(selectedSite?.scans.length),
          detail:
            selectedSite?.scans.length
              ? `${selectedSite.scans.length} saved scan${selectedSite.scans.length === 1 ? '' : 's'}`
              : 'Your completed scans stay here',
        },
      ]
    : [
        {
          label: 'Account created',
          complete: true,
          detail: user?.email || 'Authenticated',
        },
        {
          label: 'Choose a paid plan',
          complete: user?.plan !== 'free',
          detail: `Current plan: ${user?.plan || 'free'}`,
        },
        {
          label: 'Connect your site',
          complete: sites.length > 0,
          detail: sites.length > 0 ? `${sites.length} site connected` : 'Add your first site',
        },
        {
          label: 'Run Tirani',
          complete: Boolean(selectedSite?.scans[0]),
          detail: selectedSite?.scans[0] ? `Latest scan: ${selectedSite.scans[0].status}` : 'Queue your first scan',
        },
        {
          label: 'Review remediation',
          complete: latestScan?.status === 'completed',
          detail:
            latestScan?.status === 'completed'
              ? `${latestScan.remediation.totalPatches} patches ready`
              : 'Open the latest scan results',
        },
        {
          label: 'Install AIDA',
          complete: Boolean(selectedSite?.apiKey),
          detail: selectedSite?.apiKey ? 'Installation snippet ready' : 'Connect a site first',
        },
      ]
  const freeScanLimitReached = isFreePlan && (scanUsage?.remainingToday ?? 0) <= 0

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Accessibility operations
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text">
            {isFreePlan
              ? 'Run daily page scans and keep the history.'
              : 'Run Tirani, review fixes, then deploy AIDA.'}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
            {isFreePlan
              ? 'Free workspaces are for single-page Tirani scans with saved history. Your allowance resets daily, and you can upgrade later for AIDA, barrier reporting, and premium exports.'
              : 'This workspace now covers the full onboarding path: auth, billing, site connection, Tirani scans, remediation review, and AIDA installation from one protected dashboard.'}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Plan</p>
              <p className="mt-2 text-2xl font-bold text-text">{user?.plan || 'free'}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {isFreePlan ? 'Scans left today' : 'Connected sites'}
              </p>
              <p className="mt-2 text-2xl font-bold text-text">
                {isFreePlan ? scanUsage?.remainingToday ?? '...' : sites.length}
              </p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {isFreePlan ? 'Saved scans' : 'Barrier reports'}
              </p>
              <p className="mt-2 text-2xl font-bold text-text">
                {isFreePlan ? selectedSite?.scans.length ?? 0 : totalBarrierCount}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] bg-[#0f2f57] p-8 text-white shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            {isFreePlan ? 'Free scan workspace' : 'Onboarding checklist'}
          </p>
          <div className="mt-5 space-y-4">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold ${
                    item.complete ? 'bg-emerald-400 text-[#083345]' : 'bg-white/15 text-white'
                  }`}
                >
                  {item.complete ? '✓' : '•'}
                </span>
                <div>
                  <p className="m-0 text-sm font-semibold text-white">{item.label}</p>
                  <p className="m-0 text-xs text-blue-100">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/app/billing"
            className="mt-6 inline-flex rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary no-underline transition-colors hover:bg-blue-50"
          >
            {isFreePlan ? 'See paid plans' : 'Open billing'}
          </Link>
        </div>
      </section>

      {dashboardError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-error">
          {dashboardError}
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[360px,1fr]">
        <div className="space-y-6">
          <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Connect site</p>
            <h3 className="mt-3 text-2xl font-bold text-text">Add a site to onboard</h3>
            <form className="mt-6 space-y-4" onSubmit={handleCreateSite}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Site name</span>
                <input
                  type="text"
                  value={siteName}
                  onChange={(event) => setSiteName(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text"
                  placeholder="Acme Storefront"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Site URL</span>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(event) => setSiteUrl(event.target.value)}
                  required
                  className="w-full rounded-2xl border border-border px-4 py-3 text-base text-text"
                  placeholder="https://example.com"
                />
              </label>
              <button
                type="submit"
                disabled={isCreatingSite}
                className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
              >
                {isCreatingSite ? 'Connecting...' : 'Add site'}
              </button>
            </form>
          </article>

          <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Sites</p>
                <h3 className="mt-2 text-2xl font-bold text-text">Your properties</h3>
              </div>
              {isLoadingSites && <p className="text-xs text-text-secondary">Loading...</p>}
            </div>

            <div className="mt-5 space-y-3">
              {sites.length === 0 ? (
                <div className="rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                  Add your first site to begin the onboarding flow.
                </div>
              ) : (
                sites.map((site) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setSelectedSiteId(site.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      selectedSiteId === site.id
                        ? 'border-primary bg-primary-light'
                        : 'border-border bg-white hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="m-0 text-sm font-semibold text-text">{site.name}</p>
                        <p className="m-0 text-xs text-text-secondary">{site.domain}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                        {site.platform || 'custom'}
                      </span>
                    </div>
                    <p className="mt-3 m-0 text-xs text-text-secondary">
                      {site.latestScan
                        ? `Latest scan: ${site.latestScan.status}`
                        : 'No scans yet'}
                    </p>
                  </button>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          {selectedSite ? (
            <>
              <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Selected site</p>
                    <h3 className="mt-2 text-3xl font-bold text-text">{selectedSite.name}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{selectedSite.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full bg-primary-light px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                      {selectedSite.platform || 'custom/static'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleRunScan()}
                      disabled={isRunningScan || isLoadingWorkspace || freeScanLimitReached}
                      className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-70"
                    >
                      {isRunningScan ? 'Running scan...' : isFreePlan ? 'Run free scan' : 'Run Tirani'}
                    </button>
                  </div>
                </div>

                {isFreePlan && scanUsage && scanUsage.dailyLimit !== null && (
                  <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-text-secondary">
                    Free plan: {scanUsage.remainingToday ?? 0} of {scanUsage.dailyLimit} scans left today.
                    Your allowance resets daily, and every run stays saved in scan history.
                  </p>
                )}

                {scanProgress && (
                  <p className="mt-4 rounded-2xl bg-surface px-4 py-3 text-sm text-text-secondary">
                    {scanProgress}
                  </p>
                )}

                {latestScan ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Status</p>
                      <p className="mt-2 text-2xl font-bold text-text">{latestScan.status}</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Pass rate</p>
                      <p className="mt-2 text-2xl font-bold text-text">{latestScan.passRate ?? 0}%</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Violations</p>
                      <p className="mt-2 text-2xl font-bold text-text">{latestScan.violationsCount}</p>
                    </div>
                    <div className="rounded-2xl bg-surface p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Manual review</p>
                      <p className="mt-2 text-2xl font-bold text-text">{latestScan.remediation.manualReviewCount}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                    Run your first Tirani scan to populate findings, remediation, and artifact generation.
                  </div>
                )}

                {latestScan && !isFreePlan && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!latestScan.artifacts.reportAvailable}
                      onClick={() => void openArtifact(latestScan.artifacts.reportPath)}
                      className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      Open report
                    </button>
                    <button
                      type="button"
                      disabled={!latestScan.artifacts.vpatAvailable}
                      onClick={() => void openArtifact(latestScan.artifacts.vpatPath)}
                      className="rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-text transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                      Open VPAT
                    </button>
                  </div>
                )}
              </article>

              <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Scan history</p>
                    <h3 className="mt-2 text-2xl font-bold text-text">Saved runs for this site</h3>
                  </div>
                  {isLoadingWorkspace && <p className="text-xs text-text-secondary">Loading...</p>}
                </div>

                <div className="mt-5 space-y-3">
                  {selectedSite.scans.length === 0 ? (
                    <div className="rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                      No scans yet. Your free plan saves each scan here so you can compare future runs.
                    </div>
                  ) : (
                    selectedSite.scans.map((scan) => (
                      <button
                        key={scan.id}
                        type="button"
                        onClick={() => void handleSelectScan(scan.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                          selectedScanId === scan.id
                            ? 'border-primary bg-primary-light'
                            : 'border-border bg-white hover:border-primary/50'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="m-0 text-sm font-semibold text-text">
                              {scan.status === 'completed'
                                ? `Pass rate ${scan.passRate ?? 0}%`
                                : scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                            </p>
                            <p className="m-0 text-xs text-text-secondary">{formatDate(scan.createdAt)}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                            {scan.pagesScanned ?? 1} page{scan.pagesScanned === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="mt-3 m-0 text-xs text-text-secondary">
                          {scan.critical + scan.serious + scan.moderate + scan.minor} findings
                          {scan.completedAt ? ` • Completed ${formatDate(scan.completedAt)}` : ''}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </article>

              {latestScan && (
                <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Scanner engine</p>
                      <h3 className="mt-2 text-2xl font-bold text-text">Top findings</h3>
                      <div className="mt-5 space-y-3">
                        {latestScan.findingsPreview.slice(0, 4).map((finding) => (
                          <div key={finding.id} className="rounded-2xl bg-surface p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="m-0 text-sm font-semibold text-text">{finding.ruleTitle}</p>
                              {finding.severity && (
                                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                                  {finding.severity.label}
                                </span>
                              )}
                            </div>
                            {finding.wcag.length > 0 && (
                              <p className="mt-2 m-0 text-xs text-text-secondary">
                                WCAG {finding.wcag.map((criterion) => `${criterion.id} (${criterion.level})`).join(', ')}
                              </p>
                            )}
                            {finding.userImpact && (
                              <p className="mt-2 m-0 text-sm text-text-secondary">{finding.userImpact}</p>
                            )}
                            {finding.remediationSummary && (
                              <p className="mt-2 m-0 text-sm text-text-secondary">
                                Fix guidance: {finding.remediationSummary}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">AI fix engine</p>
                      <h3 className="mt-2 text-2xl font-bold text-text">Remediation preview</h3>
                      <div className="mt-5 space-y-3">
                        {latestScan.remediation.preview.slice(0, 3).map((patch) => (
                          <div key={patch.ruleId} className="rounded-2xl bg-surface p-4">
                            <p className="m-0 text-sm font-semibold text-text">{patch.ruleTitle}</p>
                            <p className="mt-2 m-0 text-xs uppercase tracking-wide text-text-secondary">
                              {patch.implementationMode || latestScan.remediation.engine?.platformProfile?.implementationMode || 'guided'} /{' '}
                              {patch.directPatchSupport || latestScan.remediation.engine?.platformProfile?.directPatchSupport || 'limited'}
                            </p>
                            {patch.userImpact && (
                              <p className="mt-2 m-0 text-sm text-text-secondary">{patch.userImpact}</p>
                            )}
                            {patch.platformInstructions[0] && (
                              <p className="mt-2 m-0 text-sm text-text-secondary">
                                Next step: {patch.platformInstructions[0]}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-sm text-text-secondary">
                    {latestScan.automationDisclosure}
                  </p>
                </article>
              )}

              {isFreePlan ? (
                <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Upgrade path</p>
                  <h3 className="mt-2 text-2xl font-bold text-text">AIDA starts on paid plans.</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
                    Your free workspace is focused on daily scans and saved history. Upgrade when you
                    want the live visitor assistant, barrier reporting, and premium exports like reports
                    and VPATs.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/app/billing"
                      className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-primary-dark"
                    >
                      See paid plans
                    </Link>
                  </div>
                </article>
              ) : (
                <>
                  <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Install AIDA</p>
                        <h3 className="mt-2 text-2xl font-bold text-text">Copy the script onto your site</h3>
                        <p className="mt-2 max-w-2xl text-sm text-text-secondary">
                          AIDA uses the site API key to submit barrier reports into this dashboard.
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-light px-3 py-2 text-xs font-semibold uppercase tracking-wide text-primary">
                        API key ready
                      </span>
                    </div>
                    <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#0f172a] p-4 text-sm leading-7 text-slate-100">
{`<script
  src="https://cdn.adibilis.com/aida.js"
  data-site-api-key="${selectedSite.apiKey}"
  data-site-url="${selectedSite.url}"
  async
></script>`}
                    </pre>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      {[
                        'Paste the script before the closing </body> tag or in your theme footer injection area.',
                        'Republish the site, then verify the assistant appears and can submit a barrier report.',
                        'Use a keyboard and screen reader to test the main flows after installation.',
                      ].map((step) => (
                        <div key={step} className="rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                          {step}
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[32px] border border-border bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Barrier reports</p>
                    <h3 className="mt-2 text-2xl font-bold text-text">Feedback from AIDA users</h3>
                    <div className="mt-5 space-y-3">
                      {isLoadingWorkspace ? (
                        <div className="rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                          Loading site workspace...
                        </div>
                      ) : barriers.length === 0 ? (
                        <div className="rounded-2xl bg-surface p-4 text-sm text-text-secondary">
                          No barrier reports yet. After AIDA is live, reports submitted from the widget will appear here.
                        </div>
                      ) : (
                        barriers.map((barrier) => (
                          <div key={barrier.id} className="rounded-2xl bg-surface p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="m-0 text-sm font-semibold text-text">{barrier.type}</p>
                              <p className="m-0 text-xs text-text-secondary">{formatDate(barrier.createdAt)}</p>
                            </div>
                            <p className="mt-2 m-0 text-sm text-text-secondary">{barrier.description}</p>
                            <p className="mt-2 m-0 text-xs text-text-secondary">
                              {barrier.pageUrl}
                              {barrier.assistiveTech ? ` • ${barrier.assistiveTech}` : ''}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </article>
                </>
              )}
            </>
          ) : (
            <article className="rounded-[32px] border border-dashed border-border bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">No site selected</p>
              <h3 className="mt-3 text-3xl font-bold text-text">Add your first site to begin onboarding.</h3>
              <p className="mt-3 text-sm text-text-secondary">
                {isFreePlan
                  ? 'Once a site is connected, this workspace will let you run daily scans and keep the history in one place.'
                  : 'Once a site is connected, this workspace will let you run Tirani, review findings, choose a plan, and install AIDA from the same flow.'}
              </p>
              <p className="mt-4 text-xs text-text-secondary">API base: {API_BASE_URL}</p>
            </article>
          )}
        </div>
      </section>
    </div>
  )
}
