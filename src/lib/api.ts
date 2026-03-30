export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://adibilis-api-production.up.railway.app'

export interface AuthUser {
  id: string
  email: string
  name: string | null
  plan: string
  createdAt?: string
}

interface ApiRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  token?: string | null
  headers?: HeadersInit
  json?: unknown
}

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

async function parseResponse(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}) {
  const { token, headers, json, ...init } = options
  const mergedHeaders = new Headers(headers || {})

  if (token) {
    mergedHeaders.set('Authorization', `Bearer ${token}`)
  }

  if (json !== undefined) {
    mergedHeaders.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: mergedHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data
        ? String(data.error)
        : `Request failed with status ${response.status}`

    throw new Error(message)
  }

  return data as T
}
