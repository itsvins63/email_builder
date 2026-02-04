'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser'
import type { Template } from '@/lib/types'

type SharedTemplateRow = {
  template: Template
  role: 'viewer' | 'editor'
}

export default function TemplatesPage() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [tab, setTab] = useState<'mine' | 'shared'>('mine')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mine, setMine] = useState<Template[]>([])
  const [shared, setShared] = useState<SharedTemplateRow[]>([])

  async function load() {
    if (!supabase) return
    setLoading(true)
    setError(null)

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr) {
      setError(userErr.message)
      setLoading(false)
      return
    }

    if (!user) {
      setError('Not signed in')
      setLoading(false)
      return
    }

    const myRes = await supabase
      .from('templates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (myRes.error) {
      setError(myRes.error.message)
      setLoading(false)
      return
    }

    const sharedRes = await supabase
      .from('template_shares')
      .select('role, template:templates(*)')
      .order('created_at', { ascending: false })

    if (sharedRes.error) {
      setError(sharedRes.error.message)
      setLoading(false)
      return
    }

    setMine((myRes.data as Template[]) || [])
    setShared((sharedRes.data as unknown as SharedTemplateRow[]) || [])
    setLoading(false)
  }

  useEffect(() => {
    // Avoid creating Supabase client during SSR/build prerender
    setSupabase(createClient())
  }, [])

  useEffect(() => {
    if (!supabase) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  async function createTemplate() {
    if (!supabase) return
    const name = prompt('Template name?')
    if (!name) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('templates')
      .insert({ name, owner_id: user.id })
      .select('*')
      .single()

    if (error) {
      const { toast } = await import('sonner')
      toast.error('Create failed', { description: error.message })
      return
    }

    setMine((prev) => [data as Template, ...prev])
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  async function renameTemplate(id: string, current: string) {
    if (!supabase) return
    const name = prompt('New name', current)
    if (!name || name === current) return

    const { error } = await supabase.from('templates').update({ name }).eq('id', id)
    if (error) {
      const { toast } = await import('sonner')
      toast.error('Rename failed', { description: error.message })
      return
    }
    setMine((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)))
  }

  async function deleteTemplate(id: string) {
    if (!supabase) return
    if (!confirm('Delete this template?')) return

    const { error } = await supabase.from('templates').delete().eq('id', id)
    if (error) {
      const { toast } = await import('sonner')
      toast.error('Delete failed', { description: error.message })
      return
    }
    setMine((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
            <p className="mt-1 text-sm text-slate-600">
              Your templates are private by default. Share from inside an editor.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={createTemplate}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New template
            </button>
            <button
              onClick={signOut}
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </div>

      <div className="mt-6 flex gap-2 text-sm">
        <button
          onClick={() => setTab('mine')}
          className={`rounded px-3 py-1 ${tab === 'mine' ? 'bg-black text-white' : 'border'}`}
        >
          My templates
        </button>
        <button
          onClick={() => setTab('shared')}
          className={`rounded px-3 py-1 ${tab === 'shared' ? 'bg-black text-white' : 'border'}`}
        >
          Shared with me
        </button>
        <button onClick={load} className="ml-auto rounded border px-3 py-1">
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-red-600">{error}</p>
      ) : tab === 'mine' ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mine.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Updated {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => renameTemplate(t.id, t.name)}
                    className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-950"
                  href={`/templates/${t.id}/edit`}
                >
                  Open editor
                </Link>
              </div>
            </div>
          ))}

          {mine.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
              No templates yet. Click <b>New template</b> to create one.
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shared.map((row) => (
            <div key={row.template.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{row.template.name}</div>
                <div className="mt-1 text-xs text-slate-500">Role: {row.role}</div>
              </div>
              <div className="mt-4">
                <Link
                  className="inline-flex w-full items-center justify-center rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  href={`/templates/${row.template.id}/edit`}
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
          {shared.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-sm text-slate-600">
              Nothing shared with you yet.
            </div>
          ) : null}
        </div>
      )}
      </div>
    </main>
  )
}
