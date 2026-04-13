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

export interface AdminUser {
  id: string
  email: string | undefined
  displayName: string | null
  avatarUrl: string | null
  status: string
  permissions: string[]
  emailConfirmed: boolean
  createdAt: string
}

export function adminUpdateUser(
  id: string,
  updates: { display_name?: string; avatar_url?: string }
): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

export function listAdminUsers(): Promise<ApiResult<AdminUser[]>> {
  return request<AdminUser[]>('/admin/users')
}

export function createAdminUser(email: string, password: string): Promise<ApiResult<{ id: string; email: string }>> {
  return request<{ id: string; email: string }>('/admin/users', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function suspendUser(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/suspend`, { method: 'PATCH' })
}

export function unsuspendUser(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/unsuspend`, { method: 'PATCH' })
}

export function adminResetPassword(id: string, password: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export function deleteAdminUser(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' })
}

export function unverifyUser(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/unverify`, { method: 'POST' })
}

export function sendMagicLink(id: string, redirectTo: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/magic-link`, {
    method: 'POST',
    body: JSON.stringify({ redirectTo }),
  })
}

export function resendVerificationEmail(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/resend-verification`, { method: 'POST' })
}

export function verifyUser(id: string): Promise<ApiResult<{ success: boolean }>> {
  return request<{ success: boolean }>(`/admin/users/${id}/verify`, { method: 'POST' })
}

export function updateUserPermissions(id: string, permissions: string[]): Promise<ApiResult<{ permissions: string[] }>> {
  return request<{ permissions: string[] }>(`/admin/users/${id}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  })
}

export function updateProfile(
  id: string,
  updates: { display_name?: string; avatar_url?: string }
): Promise<ApiResult<User>> {
  return request<User>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}

// ─── Streaming ────────────────────────────────────────────────────────────────

export interface StreamingProvider {
  name: string
  displayName: string
}

export interface ConnectedService {
  provider: string
  providerUserId: string | null
  connectedAt: string
}

export interface StreamingPlaylist {
  id: string
  name: string
  description?: string
  trackCount: number
  imageUrl?: string
  externalUrl?: string
}

export function listStreamingProviders(): Promise<ApiResult<StreamingProvider[]>> {
  return request<StreamingProvider[]>('/streaming/providers')
}

export function getConnectedServices(): Promise<ApiResult<ConnectedService[]>> {
  return request<ConnectedService[]>('/streaming/connected')
}

export function getStreamingAuthUrl(provider: string): Promise<ApiResult<{ url: string }>> {
  return request<{ url: string }>(`/streaming/${provider}/auth-url`)
}

export function submitAppleMusicToken(
  code: string,
  state: string,
): Promise<ApiResult<{ providerUserId: string }>> {
  return request<{ providerUserId: string }>('/streaming/apple_music/callback', {
    method: 'POST',
    body: JSON.stringify({ code, state }),
  })
}

export function getStreamingPlaylists(provider: string): Promise<ApiResult<StreamingPlaylist[]>> {
  return request<StreamingPlaylist[]>(`/streaming/${provider}/playlists`)
}

export function disconnectStreamingService(provider: string): Promise<ApiResult<{ disconnected: boolean }>> {
  return request<{ disconnected: boolean }>(`/streaming/${provider}`, { method: 'DELETE' })
}

// ─── ShareLists ───────────────────────────────────────────────────────────────

export interface ShareListLink {
  id?: string
  provider: string
  playlistId: string
  playlistName: string
  imageUrl: string | null
  externalUrl: string | null
  isPrimary: boolean
}

export interface ShareListSummary {
  id: string
  name: string
  ownerId: string
  createdAt: string
  links: ShareListLink[]
}

export interface ShareListTrack {
  id: string
  title: string
  artist: string
  provider?: string
  album?: string
  durationMs: number
  imageUrl?: string
  externalUrl?: string
}

export interface ShareListDetail extends ShareListSummary {
  tracks: ShareListTrack[]
}

export function listShareLists(): Promise<ApiResult<ShareListSummary[]>> {
  return request<ShareListSummary[]>('/sharelists')
}

export function createShareList(data: {
  provider: string
  playlistId: string
  playlistName: string
  imageUrl?: string | null
  externalUrl?: string | null
}): Promise<ApiResult<ShareListSummary>> {
  return request<ShareListSummary>('/sharelists', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function getShareList(id: string): Promise<ApiResult<ShareListDetail>> {
  return request<ShareListDetail>(`/sharelists/${id}`)
}

export function syncShareList(id: string): Promise<ApiResult<ShareListDetail>> {
  return request<ShareListDetail>(`/sharelists/${id}/sync`, { method: 'POST' })
}

export function linkPlaylistToShareList(
  sharelistId: string,
  data: {
    provider: string
    playlistId: string
    playlistName: string
    imageUrl?: string | null
    externalUrl?: string | null
  },
): Promise<ApiResult<{ linked: boolean }>> {
  return request<{ linked: boolean }>(`/sharelists/${sharelistId}/links`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
