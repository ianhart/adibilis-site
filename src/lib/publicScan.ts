import { buildApiUrl } from './api'

export type PublicScanStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface PublicScanCreateResponse {
  scanId?: string
  status?: PublicScanStatus
  error?: string
  requiresSignup?: boolean
  freeScanLimit?: number
  remainingFreeScans?: number
}

export interface ScanFindingPreview {
  id: string
  ruleId: string
  ruleTitle: string
  severity: {
    code: string
    label: string
    priority: number
    definition: string
  } | null
  wcag: Array<{
    id: string
    name?: string
    level: string
  }>
  pageUrl: string | null
  viewport: string | null
  selector: string | null
  help: string | null
  helpUrl: string | null
  userImpact: string | null
  htmlSnippet: string | null
  failureSummary: string | null
  target: string[]
  diagnostics: {
    kind: 'color-contrast'
    currentRatio: string | null
    requiredRatio: string | null
    foregroundColor: string | null
    backgroundColor: string | null
    fontSize: string | null
    fontWeight: string | null
  } | null
  remediationSummary: string | null
  verificationSummary: string | null
  fix: {
    selector: string | null
    explanation: string | null
    currentCode: string | null
    fixedCode: string | null
    platformInstructions: string[]
    verificationSummary: string | null
    verificationSteps: string[]
    humanReviewRequired: boolean
    implementationMode: string | null
    directPatchSupport: string | null
    helpUrl: string | null
  } | null
  confidence: {
    detection: string | null
    remediation: string | null
  } | null
}

export interface EngineMetadata {
  id: string
  name: string
  standardsSource?: {
    label: string
  } | null
  platformProfile?: {
    label: string
    implementationMode: string
    directPatchSupport: string
  } | null
}

export interface RemediationPreview {
  available: boolean
  totalPatches: number
  ruleCount: number
  manualReviewCount: number
  engine?: EngineMetadata | null
  preview: Array<{
    ruleId: string
    ruleTitle: string
    impact: string
    userImpact: string | null
    wcag: Array<{
      id: string
      level: string
    }>
    implementationMode: string | null
    directPatchSupport: string | null
    humanReviewRequired: boolean
    selector: string | null
    platformInstructions: string[]
  }>
}

export interface PublicScanResponse {
  scanId: string
  status: PublicScanStatus
  url: string | null
  domain: string | null
  platform: string | null
  platformDetection: {
    platform: string
    confidence: string
    evidence: string[]
  } | null
  passRate: number | null
  pagesScanned: number | null
  violationsCount: number
  violationsByImpact?: {
    critical: number
    serious: number
    moderate: number
    minor: number
  }
  findingsPreview: ScanFindingPreview[]
  standardsSource: {
    label: string
  } | null
  automationDisclosure: string | null
  engines: {
    scanner?: EngineMetadata | null
    remediation?: EngineMetadata | null
  } | null
  remediation: RemediationPreview
  artifacts: {
    reportAvailable: boolean
    fixesAvailable: boolean
    vpatAvailable: boolean
    reportPath?: string | null
    fixesPath?: string | null
    vpatPath?: string | null
  }
  errorMessage?: string | null
  createdAt?: string
  completedAt?: string | null
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    return {} as T
  }

  return JSON.parse(text) as T
}

export async function createPublicScan(url: string) {
  const response = await fetch(buildApiUrl('/scan'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  const data = await parseJson<PublicScanCreateResponse>(response)

  return { response, data }
}

export async function fetchPublicScan(scanId: string) {
  const response = await fetch(buildApiUrl(`/scan/${scanId}`))
  const data = await parseJson<PublicScanResponse & { error?: string }>(response)

  if (!response.ok) {
    throw new Error(data.error || 'Unable to fetch scan status')
  }

  return data
}
