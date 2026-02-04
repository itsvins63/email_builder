'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import type { Template } from '@/lib/types'

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ')
}

export default function TemplatesPage() {
  const { user, loading } = useAuth()
  const [myTemplates, setMyTemplates] = useState<Template[]>([])
  const [sharedTemplates, setSharedTemplates] = useState<Template[]>([])
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const disabled = useMemo(() => loading || !user || busy, [loading, user, busy])

  async function load() {
    if (!user) return

    // My templates
    const mine = await supabase()
      .from('templates')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!mine.error) setMyTemplates((mine.data as Template[]) ?? [])

    // Shared with me (via view)
    const shared = await supabase()
      .from('templates_shared_with_me')
      .select('*')
      .order('updated_at', { ascending: false })

    if (!shared.error) setSharedTemplates((shared.data as Template[]) ?? [])
  }

  useEffect(() => {
    if (!loading && user) load()
  }, [loading, user])

  async function createTemplate() {
    if (!user) return
    if (!name.trim()) return

    setBusy(true)
    try {
      const { data, error } = await supabase()
        .from('templates')
        .insert({ name: name.trim(), owner_id: user.id })
        .select('*')
        .single()

      if (error) throw error
      setName('')
      await load()
      if (data?.id) {
        // Go straight into editor
        window.location.href = `/templates/${data.id}`
      }
    } finally {
      setBusy(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return
    setBusy(true)
    try {
      const { error } = await supabase().from('templates').delete().eq('id', id)
      if (error) throw error
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    try {
      await supabase().auth.signOut()
      window.location.href = '/'
    } finally {
      setBusy(false)
    }
  }

  if (!loading && !user) {
    return (
      <main className="min-h-screen p-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Templates</h1>
          <p className="text-gray-600">You need to sign in first.</p>
          <Link className="rounded bg-black px-4 py-2 text-white" href="/login">
            Go to login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Templates</h1>
            <p className="text-sm text-gray-600">
              Signed in as <span className="font-mono">{user?.email}</span>
            </p>
          </div>
          <button className="rounded border px-3 py-2" onClick={signOut}>
            Sign out
          </button>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Create template</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="Template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={disabled}
            />
            <button
              className={classNames(
                'rounded bg-black px-4 py-2 text-white',
                disabled && 'opacity-50'
              )}
              onClick={createTemplate}
              disabled={disabled}
            >
              Create
            </button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">My templates</h2>
          <div className="grid gap-3">
            {myTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="rounded border px-3 py-2"
                    href={`/templates/${t.id}`}
                  >
                    Open
                  </Link>
                  <button
                    className="rounded border px-3 py-2"
                    onClick={() => deleteTemplate(t.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!myTemplates.length && (
              <p className="text-sm text-gray-600">No templates yet.</p>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Shared with me</h2>
          <div className="grid gap-3">
            {sharedTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">
                    Updated {new Date(t.updated_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    className="rounded border px-3 py-2"
                    href={`/templates/${t.id}`}
                  >
                    Open
                  </Link>
                </div>
              </div>
            ))}
            {!sharedTemplates.length && (
              <p className="text-sm text-gray-600">Nothing shared with you.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
