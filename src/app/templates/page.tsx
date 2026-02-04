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
      alert(error.message)
      return
    }

    setMine((prev) => [data as Template, ...prev])
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <div className="flex gap-2">
          <button
            onClick={createTemplate}
            className="rounded bg-black px-3 py-2 text-sm text-white"
          >
            New
          </button>
          <button
            onClick={signOut}
            className="rounded border px-3 py-2 text-sm"
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
        <ul className="mt-6 grid gap-3">
          {mine.map((t) => (
            <li key={t.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Updated: {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <Link
                  className="rounded border px-3 py-2 text-sm"
                  href={`/templates/${t.id}/edit`}
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
          {mine.length === 0 ? (
            <li className="text-sm text-muted-foreground">No templates yet.</li>
          ) : null}
        </ul>
      ) : (
        <ul className="mt-6 grid gap-3">
          {shared.map((row) => (
            <li key={row.template.id} className="rounded border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{row.template.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Role: {row.role}
                  </div>
                </div>
                <Link
                  className="rounded border px-3 py-2 text-sm"
                  href={`/templates/${row.template.id}/edit`}
                >
                  Open
                </Link>
              </div>
            </li>
          ))}
          {shared.length === 0 ? (
            <li className="text-sm text-muted-foreground">Nothing shared yet.</li>
          ) : null}
        </ul>
      )}
    </main>
  )
}
