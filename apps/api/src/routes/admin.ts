import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ApiResult, ApiError } from '@sharelist/shared'
import { supabaseAdmin } from '../lib/supabase'
import { requireAuth, requireAdmin, requirePermission } from '../middleware/auth'

const router = Router()

// All admin routes require a valid session
router.use(requireAuth)

function log(level: string, message: string, ctx: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ level, message, ...ctx }))
}

// GET /admin/users — list all users with their profiles and permissions
router.get('/', requirePermission('usermanage:listusers'), async (req: Request, res: Response) => {
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) {
    log('error', 'List users failed', { adminId: req.user!.id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  const { data: profiles } = await supabaseAdmin.from('profiles').select('id, display_name, avatar_url, status')
  const profileMap = new Map((profiles ?? []).map((p: Record<string, unknown>) => [p['id'], p]))

  const list = users.map(u => {
    const profile = profileMap.get(u.id) ?? {}
    return {
      id: u.id,
      email: u.email,
      displayName: (profile as Record<string, unknown>)['display_name'] ?? null,
      avatarUrl: (profile as Record<string, unknown>)['avatar_url'] ?? null,
      status: (profile as Record<string, unknown>)['status'] ?? 'active',
      permissions: (u.app_metadata?.['permissions'] as string[] | undefined) ?? [],
      emailConfirmed: !!u.email_confirmed_at,
      createdAt: u.created_at,
    }
  })

  const result: ApiResult<typeof list> = { data: list, error: null }
  res.json(result)
})

// POST /admin/users — create a new user
router.post('/', requirePermission('usermanage:add'), async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string }
  if (!email || !password) {
    res.status(400).json({ data: null, error: { message: 'email and password are required' } })
    return
  }

  const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !user) {
    log('error', 'Create user failed', { adminId: req.user!.id, email, error: error?.message })
    const err: ApiError = { data: null, error: { message: error?.message ?? 'Failed to create user' } }
    res.status(500).json(err)
    return
  }

  log('info', 'User created', { adminId: req.user!.id, newUserId: user.id })
  const result: ApiResult<{ id: string; email: string }> = {
    data: { id: user.id, email: user.email ?? email },
    error: null,
  }
  res.status(201).json(result)
})

// POST /admin/users/:id/password — reset a user's password
router.post('/:id/password', requirePermission('usermanage:updatepassword'), async (req: Request, res: Response) => {
  const id = req.params['id'] as string
  const { password } = req.body as { password?: string }
  if (!password || password.length < 6) {
    res.status(400).json({ data: null, error: { message: 'password must be at least 6 characters' } })
    return
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password })
  if (error) {
    log('error', 'Admin password reset failed', { adminId: req.user!.id, targetId: id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  log('info', 'Admin password reset', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// POST /admin/users/:id/verify — mark user's email as verified (admin role)
router.post('/:id/verify', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params['id'] as string

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { email_confirm: true })
  if (error) {
    log('error', 'Verify user failed', { adminId: req.user!.id, targetId: id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  log('info', 'User email verified by admin', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// PATCH /admin/users/:id — update display_name and/or avatar_url for any user (admin role)
router.patch('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params['id'] as string
  const body = req.body as Record<string, unknown>
  const updates: { display_name?: string; avatar_url?: string } = {}

  if ('display_name' in body) {
    if (typeof body['display_name'] !== 'string') {
      res.status(400).json({ data: null, error: { message: 'display_name must be a string' } })
      return
    }
    updates.display_name = body['display_name']
  }

  if ('avatar_url' in body) {
    if (typeof body['avatar_url'] !== 'string') {
      res.status(400).json({ data: null, error: { message: 'avatar_url must be a string' } })
      return
    }
    updates.avatar_url = body['avatar_url']
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ data: null, error: { message: 'No valid fields to update' } })
    return
  }

  const { error } = await supabaseAdmin.from('profiles').update(updates).eq('id', id)
  if (error) {
    log('error', 'Admin profile update failed', { adminId: req.user!.id, targetId: id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  log('info', 'Admin updated user profile', { adminId: req.user!.id, targetId: id, updates })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// PATCH /admin/users/:id/suspend
router.patch('/:id/suspend', requirePermission('usermanage:suspend'), async (req: Request, res: Response) => {
  const id = req.params['id'] as string

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'suspended' })
    .eq('id', id)

  if (profileError) {
    log('error', 'Suspend: profile update failed', { adminId: req.user!.id, targetId: id, error: profileError.message })
    const err: ApiError = { data: null, error: { message: profileError.message } }
    res.status(500).json(err)
    return
  }

  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: '876000h' })
  if (banError) {
    log('warn', 'Suspend: profile suspended but auth ban failed', { adminId: req.user!.id, targetId: id, error: banError.message })
  }

  log('info', 'User suspended', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// PATCH /admin/users/:id/unsuspend
router.patch('/:id/unsuspend', requirePermission('usermanage:suspend'), async (req: Request, res: Response) => {
  const id = req.params['id'] as string

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ status: 'active' })
    .eq('id', id)

  if (profileError) {
    log('error', 'Unsuspend: profile update failed', { adminId: req.user!.id, targetId: id, error: profileError.message })
    const err: ApiError = { data: null, error: { message: profileError.message } }
    res.status(500).json(err)
    return
  }

  const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(id, { ban_duration: 'none' })
  if (unbanError) {
    log('warn', 'Unsuspend: profile restored but auth unban failed', { adminId: req.user!.id, targetId: id, error: unbanError.message })
  }

  log('info', 'User unsuspended', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// PUT /admin/users/:id/permissions — assign the full permissions array for a user (admin role only)
router.put('/:id/permissions', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params['id'] as string
  const { permissions } = req.body as { permissions?: unknown }

  if (!Array.isArray(permissions) || permissions.some(p => typeof p !== 'string')) {
    res.status(400).json({ data: null, error: { message: 'permissions must be an array of strings' } })
    return
  }

  const valid = ['usermanage:add', 'usermanage:suspend', 'usermanage:updatepassword', 'usermanage:listusers']
  const invalid = (permissions as string[]).filter(p => !valid.includes(p))
  if (invalid.length > 0) {
    res.status(400).json({ data: null, error: { message: `Unknown permissions: ${invalid.join(', ')}` } })
    return
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: { permissions },
  })

  if (error) {
    log('error', 'Set permissions failed', { adminId: req.user!.id, targetId: id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  log('info', 'Permissions updated', { adminId: req.user!.id, targetId: id, permissions })
  const result: ApiResult<{ permissions: string[] }> = { data: { permissions: permissions as string[] }, error: null }
  res.json(result)
})

// DELETE /admin/users/:id — hard delete; admin role required (not a named user-manage permission)
router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
  const id = req.params['id'] as string

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
  if (error) {
    log('error', 'Delete user failed', { adminId: req.user!.id, targetId: id, error: error.message })
    const err: ApiError = { data: null, error: { message: error.message } }
    res.status(500).json(err)
    return
  }

  log('info', 'User deleted', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

export default router
