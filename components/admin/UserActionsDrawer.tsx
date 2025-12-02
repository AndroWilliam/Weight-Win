'use client'

import { useEffect, useState } from 'react'
import { Loader2, Send, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export interface AdminPermissionSnapshot {
  user_id: string
  is_admin: boolean
  can_manage_invitations: boolean
  last_password_reset_requested_at: string | null
  // Phase 3: User information fields
  name?: string
  phone_number?: string | null
  total_days_completed?: number
  current_streak?: number
  last_check_in?: string | null
}

interface UserActionsDrawerProps {
  userId: string | null
  email: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserActionsDrawer({ userId, email, open, onOpenChange }: UserActionsDrawerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [permissions, setPermissions] = useState<AdminPermissionSnapshot | null>(null)
  const [isSavingAdmin, setIsSavingAdmin] = useState(false)
  const [isSavingInvitations, setIsSavingInvitations] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!open || !userId) {
      return
    }

    let cancelled = false

    async function loadPermissions() {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/admin/users/${userId}/permissions`)
        const json = await response.json()

        if (!json.success) {
          throw new Error(json.error || 'Failed to load permissions')
        }

        if (!cancelled) {
          setPermissions(json.data)
        }
      } catch (error) {
        console.error('[UserActionsDrawer] loadPermissions error', error)
        if (!cancelled) {
          toast({
            title: 'Unable to load actions',
            description: 'Please try again.',
          })
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadPermissions()

    return () => {
      cancelled = true
    }
  }, [open, userId, toast])

  const toggleAdmin = async (nextValue: boolean) => {
    if (!userId) return

    setIsSavingAdmin(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/grant-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: nextValue }),
      })
      const json = await response.json()

      if (!json.success) throw new Error(json.error || 'Failed to update admin status')

      setPermissions(prev => prev ? { ...prev, is_admin: nextValue } : prev)
      toast({
        title: nextValue ? 'Admin access granted' : 'Admin access revoked',
        description: email || 'User updated successfully.',
      })
    } catch (error) {
      console.error('[UserActionsDrawer] toggleAdmin error', error)
      toast({
        title: 'Failed to update admin access',
        description: 'Please try again.',
      })
    } finally {
      setIsSavingAdmin(false)
    }
  }

  const toggleInvitations = async (nextValue: boolean) => {
    if (!userId) return

    setIsSavingInvitations(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow: nextValue }),
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error || 'Failed to update permissions')

      setPermissions(prev => prev ? { ...prev, can_manage_invitations: nextValue } : prev)
      toast({
        title: nextValue ? 'Invitation access enabled' : 'Invitation access disabled',
        description: email || 'User updated successfully.',
      })
    } catch (error) {
      console.error('[UserActionsDrawer] toggleInvitations error', error)
      toast({
        title: 'Failed to update invitation access',
        description: 'Please try again.',
      })
    } finally {
      setIsSavingInvitations(false)
    }
  }

  const sendPasswordReset = async () => {
    if (!userId) return

    setIsSendingReset(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/password-reset`, {
        method: 'POST',
      })
      const json = await response.json()
      if (!json.success) throw new Error(json.error || 'Failed to send password reset')

      setPermissions(prev => prev ? {
        ...prev,
        last_password_reset_requested_at: json.data?.last_password_reset_requested_at ?? new Date().toISOString(),
      } : prev)

      toast({
        title: 'Password reset email sent',
        description: email || 'The user will receive instructions shortly.',
      })
    } catch (error) {
      console.error('[UserActionsDrawer] sendPasswordReset error', error)
      toast({
        title: 'Failed to send password reset',
        description: 'Please try again.',
      })
    } finally {
      setIsSendingReset(false)
    }
  }

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast({
        title: 'Copied to clipboard',
        description: `${fieldName} copied successfully`,
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
      })
    }
  }

  // Helper component for info rows
  function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
    return (
      <div className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
        <span className="text-sm text-foreground font-medium text-right">{value}</span>
      </div>
    )
  }

  // Info row with copy button
  function InfoRowWithCopy({
    label,
    value,
    copyValue,
    fieldName
  }: {
    label: React.ReactNode;
    value: React.ReactNode;
    copyValue: string;
    fieldName: string;
  }) {
    const isCopied = copiedField === fieldName
    return (
      <div className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-0">
        <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground font-medium text-right">{value}</span>
          <button
            onClick={() => copyToClipboard(copyValue, fieldName)}
            className="p-1 hover:bg-muted rounded transition-colors"
            title={`Copy ${fieldName}`}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full md:max-w-lg overflow-y-auto">
        <SheetHeader className="gap-2">
          <SheetTitle className="text-xl">User Actions</SheetTitle>
          <SheetDescription>
            Manage admin access, invitations, and send password reset emails.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Phase 3: User Information Section */}
          <section className="rounded-xl border border-indigo-500/20 bg-indigo-50/5 dark:bg-indigo-950/10 p-4">
            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">
              User Information
            </h4>

            <div className="space-y-0">
              <InfoRowWithCopy
                label="Name"
                value={permissions?.name || email?.split('@')[0] || 'Unknown'}
                copyValue={permissions?.name || email?.split('@')[0] || 'Unknown'}
                fieldName="Name"
              />
              <InfoRowWithCopy
                label="Email"
                value={email ?? 'Unknown'}
                copyValue={email ?? 'Unknown'}
                fieldName="Email"
              />
              <InfoRow
                label="User ID"
                value={<span className="font-mono text-xs">{userId?.slice(0, 18)}...</span>}
              />
              {permissions?.phone_number ? (
                <InfoRowWithCopy
                  label={
                    <span className="flex items-center gap-2">
                      Phone Number
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">
                        NEW
                      </span>
                    </span>
                  }
                  value={permissions.phone_number}
                  copyValue={permissions.phone_number}
                  fieldName="Phone Number"
                />
              ) : (
                <InfoRow
                  label="Phone Number"
                  value={<span className="text-muted-foreground/60">Not provided</span>}
                />
              )}
              <InfoRow
                label="Days Completed"
                value={
                  <span
                    className={
                      (permissions?.total_days_completed ?? 0) >= 7
                        ? 'text-green-500 font-semibold'
                        : ''
                    }
                  >
                    {permissions?.total_days_completed ?? 0}/7{' '}
                    {(permissions?.total_days_completed ?? 0) >= 7 && '✓'}
                  </span>
                }
              />
              <InfoRow
                label="Current Streak"
                value={`${permissions?.current_streak ?? 0} days ${
                  (permissions?.current_streak ?? 0) > 0 ? '🔥' : ''
                }`}
              />
              <InfoRow
                label="Last Check-in"
                value={
                  permissions?.last_check_in
                    ? new Date(permissions.last_check_in).toLocaleDateString()
                    : 'Never'
                }
              />
            </div>
          </section>

          {/* Existing User Card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">User Actions</p>
              <p className="text-base font-medium text-foreground">{email ?? 'Unknown user'}</p>
              <p className="text-xs text-muted-foreground">ID: {userId}</p>
            </div>
          </div>

          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Admin access</p>
                <p className="text-xs text-muted-foreground">
                  Allow this user to sign in to the admin dashboard.
                </p>
              </div>
              <Switch
                checked={permissions?.is_admin ?? false}
                disabled={isLoading || isSavingAdmin}
                onCheckedChange={toggleAdmin}
              />
            </div>
            {isSavingAdmin && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Updating admin access...
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Manage invitations</p>
                <p className="text-xs text-muted-foreground">
                  Allow this admin to invite or remove users.
                </p>
              </div>
              <Switch
                checked={permissions?.can_manage_invitations ?? false}
                disabled={isLoading || isSavingInvitations}
                onCheckedChange={toggleInvitations}
              />
            </div>
            {isSavingInvitations && (
              <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving invitation access...
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Password reset</p>
                <p className="text-xs text-muted-foreground">
                  Send a password reset email to help the user regain access.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                {permissions?.last_password_reset_requested_at ? (
                  <span>
                    Last sent {new Date(permissions.last_password_reset_requested_at).toLocaleString()}
                  </span>
                ) : (
                  <span>No password reset sent yet</span>
                )}
              </div>
              <Button
                size="sm"
                onClick={sendPasswordReset}
                disabled={isSendingReset || isLoading}
                className="flex items-center gap-1"
              >
                {isSendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send email
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              {permissions?.is_admin ? (
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              ) : (
                <ShieldOff className="h-4 w-4 text-muted-foreground" />
              )}
              Admin summary
            </h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li className={cn('flex items-center justify-between')}> <span>Admin access</span> <span>{permissions?.is_admin ? 'Enabled' : 'Disabled'}</span></li>
              <li className={cn('flex items-center justify-between')}> <span>Manage invitations</span> <span>{permissions?.can_manage_invitations ? 'Enabled' : 'Disabled'}</span></li>
              <li className={cn('flex items-center justify-between')}> <span>Password reset</span> <span>{permissions?.last_password_reset_requested_at ? new Date(permissions.last_password_reset_requested_at).toLocaleString() : 'Never sent'}</span></li>
            </ul>
          </section>

          {/* BOLD Soccer Campaign Status */}
          <section className={cn(
            "rounded-xl border p-4 space-y-3",
            permissions?.phone_number && (permissions?.total_days_completed ?? 0) >= 7
              ? "border-green-700/30 bg-green-900/10 dark:bg-green-950/20"
              : "border-border/50 bg-muted/10"
          )}>
            <h4 className={cn(
              "text-xs font-bold uppercase tracking-wider",
              permissions?.phone_number && (permissions?.total_days_completed ?? 0) >= 7
                ? "text-green-600"
                : "text-muted-foreground"
            )}>
              🎁 BOLD Soccer Campaign
            </h4>
            <p className={cn(
              "text-sm",
              permissions?.phone_number && (permissions?.total_days_completed ?? 0) >= 7
                ? "text-muted-foreground"
                : "text-muted-foreground/70"
            )}>
              {permissions?.phone_number && (permissions?.total_days_completed ?? 0) >= 7
                ? 'This user completed 7 days and submitted their phone number for the BOLD Soccer reward. Use the Export Users button in the table to download participant data.'
                : (permissions?.total_days_completed ?? 0) < 7
                  ? 'User needs to complete 7 days to be eligible.'
                  : "User hasn't submitted phone number yet."}
            </p>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}


