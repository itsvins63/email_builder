'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { TemplateShareRole } from '@/lib/types'

export function ShareModal({
  open,
  templateId,
  onClose,
}: {
  open: boolean
  templateId: string
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TemplateShareRole>('viewer')
  const [busy, setBusy] = useState(false)
  const canSubmit = useMemo(() => !!email.trim() && !busy, [email, busy])

  useEffect(() => {
    if (!open) {
      setEmail('')
      setRole('viewer')
      setBusy(false)
    }
  }, [open])

  async function share() {
    setBusy(true)
    try {
      const trimmed = email.trim().toLowerCase()
      const { data: profile, error: pErr } = await supabase()
        .from('profiles')
        .select('id,email')
        .eq('email', trimmed)
        .maybeSingle()

      if (pErr) throw pErr
      if (!profile?.id) {
        alert('That user has not signed in yet. Ask them to log in once first.')
        return
      }

      const { error } = await supabase()
        .from('template_shares')
        .upsert(
          { template_id: templateId, shared_with: profile.id, role },
          { onConflict: 'template_id,shared_with' }
        )

      if (error) throw error
      alert('Shared!')
      onClose()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to share'
      alert(msg)
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-4 shadow">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-lg font-semibold">Share template</div>
          <button className="rounded border px-2 py-1" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-gray-600">User email</label>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">Role</label>
            <select
              className="w-full rounded border px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as TemplateShareRole)}
              disabled={busy}
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="editor">Editor (can save)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button className="rounded border px-4 py-2" onClick={onClose}>
              Cancel
            </button>
            <button
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
              onClick={share}
              disabled={!canSubmit}
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
