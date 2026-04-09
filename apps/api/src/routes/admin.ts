import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ApiResult, ApiError } from '@sharelist/shared'
import { supabaseAdmin } from '../lib/supabase'
import { requireAuth, requireAdmin } from '../middleware/auth'

const router = Router()

// All admin routes require a valid session AND admin role
router.use(requireAuth)
router.use(requireAdmin)

function log(level: string, message: string, ctx: Record<string, unknown> = {}): void {
  console.log(JSON.stringify({ level, message, ...ctx }))
}

// PATCH /admin/users/:id/suspend
router.patch('/:id/suspend', async (req: Request, res: Response) => {
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

  // Ban in Supabase auth — causes getUser() to fail for this user, revoking all active sessions
  const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: '876000h',
  })
  if (banError) {
    // Non-fatal: profile status check in requireAuth still enforces suspension
    log('warn', 'Suspend: profile suspended but auth ban failed', { adminId: req.user!.id, targetId: id, error: banError.message })
  }

  log('info', 'User suspended', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// PATCH /admin/users/:id/unsuspend
router.patch('/:id/unsuspend', async (req: Request, res: Response) => {
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

  const { error: unbanError } = await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: 'none',
  })
  if (unbanError) {
    log('warn', 'Unsuspend: profile restored but auth unban failed', { adminId: req.user!.id, targetId: id, error: unbanError.message })
  }

  log('info', 'User unsuspended', { adminId: req.user!.id, targetId: id })
  const result: ApiResult<{ success: boolean }> = { data: { success: true }, error: null }
  res.json(result)
})

// DELETE /admin/users/:id — hard delete; cascades to profiles row via FK
router.delete('/:id', async (req: Request, res: Response) => {
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
