import type { User, ApiResult, ApiError } from '@sharelist/shared'

const API_URL = import.meta.env.VITE_API_URL

// Shape returned by /auth/login and /auth/register
export interface AuthSession {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  expires_at?: number
}

export interface AuthData {
  user: { id: string; email: string } | null
  session: AuthSession | null
}

function getToken(): string | null {
  return localStorage.getItem('sl_access_token')
}

export function storeToken(token: string): void {
  localStorage.setItem('sl_access_token', token)
}

export function clearToken(): void {
  localStorage.removeItem('sl_access_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  const token = getToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })
  return res.json() as Promise<ApiResult<T>>
}

export function isError(result: ApiResult<unknown>): result is ApiError {
  return result.error !== null
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function register(email: string, password: string): Promise<ApiResult<AuthData>> {
  return request<AuthData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function login(email: string, password: string): Promise<ApiResult<AuthData>> {
  return request<AuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function logout(): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' })
}

export function getMe(): Promise<ApiResult<User>> {
  return request<User>('/auth/me')
}

export function requestPasswordReset(
  email: string,
  redirectTo: string
): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email, redirectTo }),
  })
}

export function confirmPasswordReset(
  accessToken: string,
  password: string
): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken, password }),
  })
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function updateProfile(
  id: string,
  updates: { display_name?: string; avatar_url?: string }
): Promise<ApiResult<User>> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}
