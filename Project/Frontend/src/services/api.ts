export interface ApiResponse<T> {
  ok: boolean
  message?: string
  data: T
}

export function getAuthToken() {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(path, { ...options, headers })
  const payload = await response.json().catch(() => ({ message: 'Ungültige Serverantwort' })) as {
    message?: string
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
      sessionStorage.removeItem('authToken')
      sessionStorage.removeItem('authUser')
    }
    throw new Error(payload.message || `Anfrage fehlgeschlagen (${response.status})`)
  }

  return payload as T
}
