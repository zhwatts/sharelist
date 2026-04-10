import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CloseOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import * as api from '../lib/api'
import type { AdminUser } from '../lib/api'

const SL = {
  bg: '#111314',
  surface: '#1C1F21',
  border: '#2A2D30',
  accent: '#38BDF8',
  mint: '#4ADE80',
  text: '#F1F5F9',
  muted: '#64748B',
}

const PERMISSION_META = [
  { key: 'usermanage:listusers', label: 'View users', description: 'Can access the user management page' },
  { key: 'usermanage:add', label: 'Create users', description: 'Can create new user accounts' },
  { key: 'usermanage:suspend', label: 'Suspend users', description: 'Can suspend and unsuspend accounts' },
  { key: 'usermanage:updatepassword', label: 'Reset passwords', description: 'Can reset passwords for other users' },
  { key: 'usermanage:deleteusers', label: 'Delete users', description: 'Can permanently delete user accounts' },
  { key: 'usermanage:editpermissions', label: 'Edit permissions', description: 'Can grant or revoke permissions for other users' },
  { key: 'usermanage:selfmanage', label: 'Full self-management', description: 'Can manage all aspects of their own account, including their own permissions' },
]

function SectionLabel({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  return (
    <Typography.Text
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: danger ? '#f87171' : SL.muted,
        display: 'block',
        marginBottom: 16,
      }}
    >
      {children}
    </Typography.Text>
  )
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: `${SL.border}80`, margin: '0 -24px' }} />
}

export function AdminUsers() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm] = Form.useForm()
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  const [target, setTarget] = useState<AdminUser | null>(null)

  const [profileForm] = Form.useForm()
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const [pwdForm] = Form.useForm()
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState<string | null>(null)
  const [pwdSuccess, setPwdSuccess] = useState(false)

  const [permSelection, setPermSelection] = useState<string[]>([])
  const [permLoading, setPermLoading] = useState(false)
  const [permError, setPermError] = useState<string | null>(null)
  const [permSuccess, setPermSuccess] = useState(false)

  const [suspendLoading, setSuspendLoading] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [unverifyLoading, setUnverifyLoading] = useState(false)
  const [magicLinkLoading, setMagicLinkLoading] = useState(false)
  const [magicLinkSuccess, setMagicLinkSuccess] = useState(false)

  const canAdd = me?.permissions.includes('usermanage:add') ?? false
  const canSuspend = me?.permissions.includes('usermanage:suspend') ?? false
  const canResetPassword = me?.permissions.includes('usermanage:updatepassword') ?? false
  const canDelete = me?.permissions.includes('usermanage:deleteusers') ?? false
  const canEditPermissions = me?.permissions.includes('usermanage:editpermissions') ?? false
  const canSelfManage = me?.permissions.includes('usermanage:selfmanage') ?? false
  const isAdmin = me?.role === 'admin'
  const isSelf = target?.id === me?.id
  const canActOnTarget = !isSelf || canSelfManage
  const readOnly = !isAdmin && !canSuspend && !canResetPassword && !canEditPermissions && !canDelete && !(canSelfManage && isSelf)

  const load = async () => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) { setLoadError(result.error.message); return }
    setUsers(result.data)
  }

  useEffect(() => { void load() }, [])

  const openManage = (u: AdminUser) => {
    setTarget(u)
    profileForm.setFieldsValue({ displayName: u.displayName ?? '', avatarUrl: u.avatarUrl ?? '' })
    pwdForm.resetFields()
    setPermSelection(u.permissions)
    setProfileError(null); setProfileSuccess(false)
    setPwdError(null); setPwdSuccess(false)
    setPermError(null); setPermSuccess(false)
    setDeleteConfirm(false)
    setResendSuccess(false)
    setMagicLinkSuccess(false)
  }

  const closeManage = () => setTarget(null)

  const patchTarget = (patch: Partial<AdminUser>) => {
    setTarget(prev => prev ? { ...prev, ...patch } : prev)
    setUsers(prev => prev.map(u => u.id === patch.id ? { ...u, ...patch } : u))
  }

  const reloadAndSync = async (id: string) => {
    const result = await api.listAdminUsers()
    if (api.isError(result)) return
    setUsers(result.data)
    const updated = result.data.find(u => u.id === id)
    if (updated) { setTarget(updated); setPermSelection(updated.permissions) }
  }

  const handleAdd = async (values: { email: string; password: string }) => {
    setAddError(null); setAddLoading(true)
    const result = await api.createAdminUser(values.email, values.password)
    setAddLoading(false)
    if (api.isError(result)) { setAddError(result.error.message); return }
    addForm.resetFields()
    setShowAddForm(false)
    await load()
  }

  const handleProfileSave = async (values: { displayName: string; avatarUrl?: string }) => {
    if (!target) return
    setProfileError(null); setProfileSuccess(false); setProfileLoading(true)
    const result = await api.adminUpdateUser(target.id, { display_name: values.displayName, avatar_url: values.avatarUrl })
    setProfileLoading(false)
    if (api.isError(result)) { setProfileError(result.error.message); return }
    setProfileSuccess(true)
    await reloadAndSync(target.id)
  }

  const handleSuspendToggle = async () => {
    if (!target) return
    setSuspendLoading(true)
    const isSuspended = target.status === 'suspended'
    const fn = isSuspended ? api.unsuspendUser : api.suspendUser
    const result = await fn(target.id)
    setSuspendLoading(false)
    if (api.isError(result)) return
    patchTarget({ id: target.id, status: isSuspended ? 'active' : 'suspended' })
    await reloadAndSync(target.id)
  }

  const handleVerify = async () => {
    if (!target) return
    setVerifyLoading(true)
    const result = await api.verifyUser(target.id)
    setVerifyLoading(false)
    if (api.isError(result)) return
    patchTarget({ id: target.id, emailConfirmed: true })
    await reloadAndSync(target.id)
  }

  const handleUnverify = async () => {
    if (!target) return
    setUnverifyLoading(true)
    const result = await api.unverifyUser(target.id)
    setUnverifyLoading(false)
    if (api.isError(result)) return
    patchTarget({ id: target.id, emailConfirmed: false })
    await reloadAndSync(target.id)
  }

  const handleMagicLink = async () => {
    if (!target) return
    setMagicLinkLoading(true); setMagicLinkSuccess(false)
    const result = await api.sendMagicLink(target.id)
    setMagicLinkLoading(false)
    if (api.isError(result)) return
    setMagicLinkSuccess(true)
  }

  const handleResendVerification = async () => {
    if (!target) return
    setResendLoading(true); setResendSuccess(false)
    const result = await api.resendVerificationEmail(target.id)
    setResendLoading(false)
    if (api.isError(result)) return
    setResendSuccess(true)
  }

  const handlePasswordSave = async (values: { password: string }) => {
    if (!target) return
    setPwdError(null); setPwdSuccess(false); setPwdLoading(true)
    const result = await api.adminResetPassword(target.id, values.password)
    setPwdLoading(false)
    if (api.isError(result)) { setPwdError(result.error.message); return }
    pwdForm.resetFields()
    setPwdSuccess(true)
  }

  const handlePermSave = async () => {
    if (!target) return
    setPermError(null); setPermSuccess(false); setPermLoading(true)
    const result = await api.updateUserPermissions(target.id, permSelection)
    setPermLoading(false)
    if (api.isError(result)) { setPermError(result.error.message); return }
    setPermSuccess(true)
    await reloadAndSync(target.id)
  }

  const handleDelete = async () => {
    if (!target) return
    setDeleteLoading(true)
    const result = await api.deleteAdminUser(target.id)
    setDeleteLoading(false)
    if (api.isError(result)) return
    closeManage(); await load()
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 960, margin: '64px auto', padding: '0 24px' }}>
        <Alert message={`Failed to load users: ${loadError}`} type="error" showIcon />
      </div>
    )
  }

  const columns: ColumnsType<AdminUser> = [
    {
      title: 'User',
      key: 'user',
      render: (_, u) => (
        <div>
          <Typography.Text style={{ color: SL.text, fontWeight: 500, display: 'block' }}>
            {u.displayName ?? u.email}
          </Typography.Text>
          {u.displayName && (
            <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>{u.email}</Typography.Text>
          )}
          {!u.emailConfirmed && (
            <Tag color="orange" style={{ marginTop: 4, fontSize: 11 }}>unverified</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, u) => (
        <Tag
          color={u.status === 'suspended' ? 'error' : 'success'}
          style={{ borderRadius: 20, fontWeight: 600 }}
        >
          {u.status}
        </Tag>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_, u) =>
        u.permissions.length === 0 ? (
          <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>none</Typography.Text>
        ) : (
          <Flex wrap="wrap" gap={4}>
            {u.permissions.map(p => (
              <Tag
                key={p}
                color="processing"
                style={{ borderRadius: 6, fontSize: 11, fontWeight: 500 }}
              >
                {p.replace('usermanage:', '')}
              </Tag>
            ))}
          </Flex>
        ),
    },
    {
      title: 'Joined',
      key: 'joined',
      render: (_, u) => (
        <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>
          {new Date(u.createdAt).toLocaleDateString()}
        </Typography.Text>
      ),
    },
    {
      key: 'actions',
      align: 'right',
      render: (_, u) => (
        <Button
          size="small"
          onClick={() => openManage(u)}
          style={{ borderRadius: 8, color: SL.muted, borderColor: SL.border }}
        >
          Manage
        </Button>
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
      <Flex align="center" justify="space-between" style={{ marginBottom: 24 }}>
        <Typography.Title level={3} style={{ color: SL.text, margin: 0 }}>
          User Management
        </Typography.Title>
        {canAdd && (
          <Button
            type="primary"
            onClick={() => setShowAddForm(v => !v)}
            style={{ borderRadius: 10 }}
          >
            {showAddForm ? 'Cancel' : '+ Add user'}
          </Button>
        )}
      </Flex>

      {/* Add user form */}
      {showAddForm && (
        <div
          style={{
            marginBottom: 24,
            padding: 20,
            backgroundColor: SL.surface,
            border: `1px solid ${SL.border}`,
            borderRadius: 20,
          }}
        >
          <Typography.Text style={{ color: SL.text, fontWeight: 600, display: 'block', marginBottom: 16 }}>
            New user
          </Typography.Text>
          <Form form={addForm} layout="inline" onFinish={handleAdd} style={{ flexWrap: 'wrap', gap: 8 }}>
            <Form.Item name="email" rules={[{ required: true, type: 'email' }]} style={{ flex: 1, minWidth: 200 }}>
              <Input placeholder="Email address" style={{ borderRadius: 10 }} />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, min: 6, message: 'Min 6 chars' }]}
              style={{ flex: 1, minWidth: 200 }}
            >
              <Input.Password placeholder="Temporary password (min 6 chars)" style={{ borderRadius: 10 }} />
            </Form.Item>
            {addError && (
              <Form.Item style={{ width: '100%' }}>
                <Alert message={addError} type="error" showIcon style={{ borderRadius: 8 }} />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={addLoading} style={{ borderRadius: 8 }}>
                Create user
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      {/* User table */}
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        pagination={false}
        style={{ borderRadius: 20, overflow: 'hidden' }}
        locale={{ emptyText: <Typography.Text style={{ color: SL.muted }}>No users found</Typography.Text> }}
      />

      {/* Manage modal */}
      <Modal
        open={!!target}
        onCancel={closeManage}
        footer={
          <Button onClick={closeManage} style={{ borderRadius: 8, color: SL.muted, borderColor: SL.border }}>
            Close
          </Button>
        }
        width={640}
        closeIcon={<CloseOutlined style={{ color: SL.muted }} />}
        styles={{
          header: { backgroundColor: SL.surface, borderBottom: `1px solid ${SL.border}`, padding: '20px 24px' },
          body: { padding: 0, maxHeight: '70vh', overflowY: 'auto' },
          footer: {
            backgroundColor: `${SL.bg}50`,
            borderTop: `1px solid ${SL.border}`,
            padding: '12px 24px',
          },
        }}
        title={
          target && (
            <Flex align="center" gap={12}>
              <Avatar
                size={44}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: 'rgba(56,189,248,0.15)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  color: SL.accent,
                  flexShrink: 0,
                }}
              >
                {(target.displayName ?? target.email ?? '?').charAt(0).toUpperCase()}
              </Avatar>
              <div style={{ minWidth: 0, flex: 1 }}>
                <Typography.Text style={{ color: SL.text, fontWeight: 600, display: 'block' }}>
                  {target.displayName ?? target.email}
                </Typography.Text>
                {target.displayName && (
                  <Typography.Text style={{ color: SL.muted, fontSize: 13 }}>{target.email}</Typography.Text>
                )}
              </div>
              <Tag
                color={target.status === 'suspended' ? 'error' : 'success'}
                style={{ borderRadius: 20, fontWeight: 600 }}
              >
                {target.status}
              </Tag>
            </Flex>
          )
        }
      >
        {target && (
          <div>

            {/* Profile */}
            <div style={{ padding: '20px 24px' }}>
              <SectionLabel>Profile</SectionLabel>
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileSave}
                requiredMark={false}
              >
                <Flex gap={12}>
                  <Form.Item
                    name="displayName"
                    label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Display name</span>}
                    style={{ flex: 1, marginBottom: 12 }}
                  >
                    <Input
                      placeholder="Display name"
                      disabled={readOnly}
                      style={{ borderRadius: 10 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="avatarUrl"
                    label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Avatar URL</span>}
                    style={{ flex: 1, marginBottom: 12 }}
                  >
                    <Input placeholder="https://…" disabled={readOnly} style={{ borderRadius: 10 }} />
                  </Form.Item>
                </Flex>
                {profileError && <Alert message={profileError} type="error" showIcon style={{ borderRadius: 8, marginBottom: 12 }} />}
                {!readOnly && (
                  <Flex align="center" gap={12}>
                    <Button type="primary" htmlType="submit" loading={profileLoading} style={{ borderRadius: 8 }}>
                      Save changes
                    </Button>
                    {profileSuccess && <Typography.Text style={{ color: SL.mint, fontWeight: 500, fontSize: 14 }}>✓ Saved</Typography.Text>}
                  </Flex>
                )}
              </Form>
            </div>

            <Divider />

            {/* Authentication */}
            <div style={{ padding: '20px 24px' }}>
              <SectionLabel>Authentication</SectionLabel>
              <Space direction="vertical" size={20} style={{ width: '100%' }}>

                {/* Email verification */}
                <Flex align="center" justify="space-between" gap={16}>
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text style={{ color: SL.text, fontWeight: 500, display: 'block', fontSize: 14 }}>
                      Email verification
                    </Typography.Text>
                    <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>{target.email}</Typography.Text>
                  </div>
                  <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                    <Tag
                      color={target.emailConfirmed ? 'success' : 'warning'}
                      style={{ borderRadius: 20, fontWeight: 600 }}
                    >
                      {target.emailConfirmed ? '✓ Verified' : 'Unverified'}
                    </Tag>
                    {!readOnly && (target.emailConfirmed ? (
                      <Button size="small" loading={unverifyLoading} onClick={handleUnverify} style={{ borderRadius: 8, borderColor: SL.border, color: SL.muted }}>
                        Revoke
                      </Button>
                    ) : (
                      <>
                        <Button size="small" loading={verifyLoading} onClick={handleVerify} style={{ borderRadius: 8, borderColor: 'rgba(74,222,128,0.4)', color: SL.mint }}>
                          Mark verified
                        </Button>
                        <Button size="small" loading={resendLoading} onClick={handleResendVerification} style={{ borderRadius: 8, borderColor: SL.border, color: SL.muted }}>
                          Resend email
                        </Button>
                        {resendSuccess && <Typography.Text style={{ color: SL.mint, fontSize: 12, fontWeight: 500 }}>✓ Sent</Typography.Text>}
                      </>
                    ))}
                  </Flex>
                </Flex>

                {/* Magic link */}
                {!readOnly && (
                  <Flex align="center" justify="space-between" gap={16}>
                    <div>
                      <Typography.Text style={{ color: SL.text, fontWeight: 500, display: 'block', fontSize: 14 }}>
                        Magic login link
                      </Typography.Text>
                      <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>
                        Send a one-time passwordless sign-in link
                      </Typography.Text>
                    </div>
                    <Flex align="center" gap={8} style={{ flexShrink: 0 }}>
                      <Button size="small" loading={magicLinkLoading} onClick={handleMagicLink} style={{ borderRadius: 8, borderColor: SL.border, color: SL.muted }}>
                        Send link
                      </Button>
                      {magicLinkSuccess && <Typography.Text style={{ color: SL.mint, fontSize: 12, fontWeight: 500 }}>✓ Sent</Typography.Text>}
                    </Flex>
                  </Flex>
                )}

              </Space>
            </div>

            {/* Account access */}
            {canActOnTarget && (
              <>
                <Divider />
                <div style={{ padding: '20px 24px' }}>
                  <SectionLabel>Account access</SectionLabel>
                  <Flex align="center" justify="space-between" gap={16}>
                    <div>
                      <Typography.Text style={{ color: SL.text, fontWeight: 500, display: 'block', fontSize: 14 }}>
                        Login access
                      </Typography.Text>
                      <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>
                        {target.status === 'suspended'
                          ? 'This user is blocked from signing in'
                          : 'This user can sign in normally'}
                      </Typography.Text>
                    </div>
                    {(canSuspend || (canSelfManage && isSelf)) && (
                      <Button
                        size="small"
                        loading={suspendLoading}
                        onClick={handleSuspendToggle}
                        style={{
                          borderRadius: 8,
                          flexShrink: 0,
                          ...(target.status === 'suspended'
                            ? { borderColor: 'rgba(74,222,128,0.4)', color: SL.mint }
                            : { borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }),
                        }}
                      >
                        {target.status === 'suspended' ? 'Restore access' : 'Suspend access'}
                      </Button>
                    )}
                  </Flex>
                </div>
              </>
            )}

            {/* Security */}
            {(canResetPassword || (canSelfManage && isSelf)) && canActOnTarget && (
              <>
                <Divider />
                <div style={{ padding: '20px 24px' }}>
                  <SectionLabel>Security</SectionLabel>
                  <Form form={pwdForm} layout="vertical" onFinish={handlePasswordSave} requiredMark={false}>
                    <Form.Item
                      name="password"
                      label={<span style={{ color: SL.text, fontSize: 14, fontWeight: 500 }}>Set new password</span>}
                      rules={[{ required: true, min: 6, message: 'Min 6 characters' }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Flex gap={8}>
                        <Input.Password placeholder="Min 6 characters" style={{ borderRadius: 10, flex: 1 }} />
                        <Button type="primary" htmlType="submit" loading={pwdLoading} style={{ borderRadius: 8, whiteSpace: 'nowrap' }}>
                          Set password
                        </Button>
                      </Flex>
                    </Form.Item>
                    {pwdError && <Alert message={pwdError} type="error" showIcon style={{ borderRadius: 8 }} />}
                    {pwdSuccess && <Typography.Text style={{ color: SL.mint, fontWeight: 500, fontSize: 14 }}>✓ Password updated</Typography.Text>}
                  </Form>
                </div>
              </>
            )}

            {/* Permissions */}
            {canActOnTarget && (
              <>
                <Divider />
                <div style={{ padding: '20px 24px' }}>
                  <SectionLabel>Permissions</SectionLabel>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    {PERMISSION_META.map(({ key, label, description }) => (
                      <Flex key={key} align="center" justify="space-between" style={{ padding: '10px 0' }}>
                        <div>
                          <Typography.Text style={{ color: SL.text, fontWeight: 500, fontSize: 14, display: 'block' }}>
                            {label}
                          </Typography.Text>
                          <Typography.Text style={{ color: SL.muted, fontSize: 12 }}>{description}</Typography.Text>
                        </div>
                        <Switch
                          checked={permSelection.includes(key)}
                          disabled={!(canEditPermissions || (canSelfManage && isSelf))}
                          onChange={checked => {
                            setPermSelection(prev =>
                              checked ? [...prev, key] : prev.filter(x => x !== key)
                            )
                          }}
                          style={{ marginLeft: 24, flexShrink: 0 }}
                        />
                      </Flex>
                    ))}
                  </Space>
                  {permError && <Alert message={permError} type="error" showIcon style={{ borderRadius: 8, marginTop: 12 }} />}
                  {(canEditPermissions || (canSelfManage && isSelf)) && (
                    <Flex align="center" gap={12} style={{ marginTop: 16 }}>
                      <Button type="primary" loading={permLoading} onClick={handlePermSave} style={{ borderRadius: 8 }}>
                        Save permissions
                      </Button>
                      {permSuccess && <Typography.Text style={{ color: SL.mint, fontWeight: 500, fontSize: 14 }}>✓ Saved</Typography.Text>}
                    </Flex>
                  )}
                </div>
              </>
            )}

            {/* Danger zone */}
            {(canDelete || (canSelfManage && isSelf)) && canActOnTarget && (
              <>
                <Divider />
                <div style={{ padding: '20px 24px' }}>
                  <SectionLabel danger>Danger zone</SectionLabel>
                  {!deleteConfirm ? (
                    <Flex
                      align="center"
                      justify="space-between"
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid rgba(239,68,68,0.2)',
                        backgroundColor: 'rgba(239,68,68,0.05)',
                      }}
                    >
                      <div>
                        <Typography.Text style={{ color: '#fca5a5', fontWeight: 500, fontSize: 14, display: 'block' }}>
                          Delete this account
                        </Typography.Text>
                        <Typography.Text style={{ color: '#f87171', fontSize: 12 }}>
                          Permanently removes the user and all their data
                        </Typography.Text>
                      </div>
                      <Button
                        danger
                        size="small"
                        onClick={() => setDeleteConfirm(true)}
                        style={{ borderRadius: 8, flexShrink: 0, marginLeft: 16 }}
                      >
                        Delete user
                      </Button>
                    </Flex>
                  ) : (
                    <div
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid rgba(239,68,68,0.3)',
                        backgroundColor: 'rgba(239,68,68,0.1)',
                      }}
                    >
                      <Typography.Text style={{ color: '#fca5a5', fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>
                        This cannot be undone
                      </Typography.Text>
                      <Typography.Text style={{ color: '#f87171', fontSize: 14, display: 'block', marginBottom: 16 }}>
                        Permanently delete <strong>{target.email}</strong> and all associated data?
                      </Typography.Text>
                      <Flex gap={8}>
                        <Button danger loading={deleteLoading} onClick={handleDelete} style={{ borderRadius: 8 }}>
                          Yes, delete permanently
                        </Button>
                        <Button onClick={() => setDeleteConfirm(false)} style={{ borderRadius: 8, borderColor: SL.border, color: SL.muted }}>
                          Cancel
                        </Button>
                      </Flex>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        )}
      </Modal>
    </div>
  )
}
