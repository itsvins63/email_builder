'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Editor } from 'grapesjs'
import GrapesEditor from '@/components/GrapesEditor'
import { createClient } from '@/lib/supabase/browser'
import type { Profile, Template } from '@/lib/types'

type VersionRow = {
  id: string
  template_id: string
  version: number
  saved_by: string
  created_at: string
}

type ShareRow = {
  template_id: string
  shared_with: string
  role: 'viewer' | 'editor'
  created_at: string
  profile?: Profile
}

export default function EditTemplatePage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editor, setEditor] = useState<Editor | null>(null)
  const [template, setTemplate] = useState<Template | null>(null)
  const [canEdit, setCanEdit] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  const [versions, setVersions] = useState<VersionRow[]>([])
  const [shares, setShares] = useState<ShareRow[]>([])

  async function loadAll() {
    if (!supabase) return
    setLoading(true)
    setError(null)

    const { data: templateResRaw, error: tErr } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    const templateRes = templateResRaw as unknown as Template

    if (tErr) {
      setError(tErr.message)
      setLoading(false)
      return
    }

    setTemplate(templateRes)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isOwner = Boolean(user?.id && user.id === templateRes.owner_id)
    setIsOwner(isOwner)

    // If not owner, check share role
    let shareRole: 'viewer' | 'editor' | null = null
    if (!isOwner && user?.id) {
      const { data: shareRes } = await supabase
        .from('template_shares')
        .select('role')
        .eq('template_id', id)
        .eq('shared_with', user.id)
        .maybeSingle()
      const r = shareRes?.role
      shareRole = r === 'viewer' || r === 'editor' ? r : null
    }

    setCanEdit(Boolean(isOwner || shareRole === 'editor'))

    const { data: vRes } = await supabase
      .from('template_versions')
      .select('id, template_id, version, saved_by, created_at')
      .eq('template_id', id)
      .order('version', { ascending: false })
      .limit(20)

    setVersions((vRes as unknown as VersionRow[]) || [])

    if (isOwner) {
      const { data: sRes } = await supabase
        .from('template_shares')
        .select('template_id, shared_with, role, created_at, profile:profiles(id,email,created_at)')
        .eq('template_id', id)
        .order('created_at', { ascending: false })

      setShares((sRes as unknown as ShareRow[]) || [])
    } else {
      setShares([])
    }

    setLoading(false)
  }

  useEffect(() => {
    // Avoid creating Supabase client during SSR/build prerender
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase) return
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, supabase])

  async function save() {
    if (!supabase) return
    if (!editor || !template) return
    if (!canEdit) {
      alert('You only have view access.')
      return
    }

    setSaving(true)
    setError(null)

    const project = editor.getProjectData()
    const html = editor.getHtml()
    const css = editor.getCss()
    const combinedHtml = `<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`

    const nextVersion = (versions[0]?.version || 0) + 1

    const upRes = await supabase
      .from('templates')
      .update({ current_design_json: project, current_html: combinedHtml })
      .eq('id', template.id)
      .select('*')
      .single()

    if (upRes.error) {
      setError(upRes.error.message)
      setSaving(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const verRes = await supabase.from('template_versions').insert({
      template_id: template.id,
      version: nextVersion,
      saved_by: user?.id,
      design_json: project,
      html: combinedHtml,
    })

    if (verRes.error) {
      setError(verRes.error.message)
      setSaving(false)
      return
    }

    setTemplate(upRes.data as Template)
    await loadAll()
    setSaving(false)
  }

  async function exportHtml() {
    if (!editor) return
    const html = editor.getHtml()
    const css = editor.getCss()
    const combinedHtml = `<!doctype html><html><head><style>${css}</style></head><body>${html}</body></html>`
    await navigator.clipboard.writeText(combinedHtml)
    alert('HTML copied to clipboard')
  }

  async function addShare() {
    if (!supabase) return
    if (!template) return
    const email = prompt('Share with which email? (User must have logged in once)')
    if (!email) return
    const roleInput = prompt('Role? viewer/editor', 'viewer') || 'viewer'
    const role: 'viewer' | 'editor' = roleInput === 'editor' ? 'editor' : 'viewer'

    const { data: profileRes, error: pErr } = await supabase
      .from('profiles')
      .select('id,email,created_at')
      .eq('email', email)
      .single()

    if (pErr) {
      alert('User not found. Ask them to sign in once first.')
      return
    }

    const { error } = await supabase.from('template_shares').insert({
      template_id: template.id,
      shared_with: profileRes.id,
      role,
    })

    if (error) {
      alert(error.message)
      return
    }

    await loadAll()
  }

  async function removeShare(sharedWith: string) {
    if (!supabase) return
    if (!confirm('Remove access?')) return
    const { error } = await supabase
      .from('template_shares')
      .delete()
      .eq('template_id', id)
      .eq('shared_with', sharedWith)

    if (error) alert(error.message)
    await loadAll()
  }

  return (
    <main className="p-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.push('/templates')}
            className="text-sm text-muted-foreground"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">
            {template ? template.name : 'Template'}
          </h1>
          <div className="text-xs text-muted-foreground">
            {canEdit ? 'Editable' : 'View only'}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={exportHtml} className="rounded border px-3 py-2 text-sm">
            Copy HTML
          </button>
          <button
            onClick={save}
            disabled={saving || !canEdit}
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save (new version)'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto mt-6 max-w-6xl text-sm text-muted-foreground">
          Loading…
        </div>
      ) : error ? (
        <div className="mx-auto mt-6 max-w-6xl text-sm text-red-600">{error}</div>
      ) : (
        <div className="mx-auto mt-4 grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded border">
            <GrapesEditor
              initialProjectData={template?.current_design_json || undefined}
              onReady={setEditor}
            />
          </div>

          <aside className="space-y-4">
            <section className="rounded border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Versions</div>
              </div>
              <ul className="space-y-1 text-xs">
                {versions.map((v) => (
                  <li key={v.id} className="flex items-center justify-between">
                    <span>v{v.version}</span>
                    <span className="text-muted-foreground">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
                {versions.length === 0 ? (
                  <li className="text-muted-foreground">No versions yet.</li>
                ) : null}
              </ul>
            </section>

            <section className="rounded border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-medium">Sharing</div>
                <button
                  onClick={addShare}
                  className="rounded border px-2 py-1 text-xs"
                  disabled={!template || !isOwner}
                  title={!isOwner ? 'Owner only' : ''}
                >
                  Add
                </button>
              </div>
              <ul className="space-y-2 text-xs">
                {shares.map((s) => (
                  <li key={s.shared_with} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate">
                        {s.profile?.email || s.shared_with}
                      </div>
                      <div className="text-muted-foreground">role: {s.role}</div>
                    </div>
                    {isOwner ? (
                      <button
                        onClick={() => removeShare(s.shared_with)}
                        className="rounded border px-2 py-1"
                      >
                        Remove
                      </button>
                    ) : null}
                  </li>
                ))}
                {shares.length === 0 ? (
                  <li className="text-muted-foreground">Not shared with anyone.</li>
                ) : null}
              </ul>
            </section>
          </aside>
        </div>
      )}
    </main>
  )
}
