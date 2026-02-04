'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'
import type { Template, TemplateVersion } from '@/lib/types'
import type { GrapesInstance } from '@/components/GrapesEditor'
import type { ProjectData } from 'grapesjs'
import { ShareModal } from '@/components/ShareModal'

const GrapesEditor = dynamic(() => import('@/components/GrapesEditor'), {
  ssr: false,
})

function buildHtmlDocument(html: string, css: string) {
  return `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8"/>\n<meta name="viewport" content="width=device-width, initial-scale=1"/>\n<style>${css}</style>\n</head>\n<body>${html}</body>\n</html>`
}

export default function TemplateEditorPage() {
  const params = useParams<{ id: string }>()
  const templateId = params.id

  const { user, loading } = useAuth()
  const [template, setTemplate] = useState<Template | null>(null)
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [busy, setBusy] = useState(false)
  const [editor, setEditor] = useState<GrapesInstance | null>(null)
  const [shareOpen, setShareOpen] = useState(false)

  const canEdit = useMemo(() => !!user && !!template, [user, template])

  async function load() {
    if (!user) return

    const t = await supabase().from('templates_accessible').select('*').eq('id', templateId).maybeSingle()
    if (t.error) throw t.error
    setTemplate((t.data as Template) ?? null)

    const v = await supabase()
      .from('template_versions')
      .select('*')
      .eq('template_id', templateId)
      .order('version', { ascending: false })
      .limit(20)

    if (v.error) throw v.error
    setVersions((v.data as TemplateVersion[]) ?? [])
  }

  useEffect(() => {
    if (!loading && user) {
      load().catch((e) => alert(e?.message ?? 'Failed to load'))
    }
  }, [loading, user])

  async function saveNewVersion() {
    if (!editor || !user) return
    setBusy(true)
    try {
      const projectData = editor.getProjectData()
      const html = editor.getHtml() ?? ''
      const css = editor.getCss() ?? ''
      const htmlDoc = buildHtmlDocument(html, css)

      // compute next version
      const maxRes = await supabase()
        .from('template_versions')
        .select('version')
        .eq('template_id', templateId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (maxRes.error) throw maxRes.error
      const nextVersion = (maxRes.data?.version ?? 0) + 1

      const ins = await supabase()
        .from('template_versions')
        .insert({
          template_id: templateId,
          version: nextVersion,
          saved_by: user!.id,
          design_json: projectData,
          html: htmlDoc,
        })

      if (ins.error) throw ins.error

      const upd = await supabase()
        .from('templates')
        .update({ current_design_json: projectData, current_html: htmlDoc })
        .eq('id', templateId)

      if (upd.error) throw upd.error

      await load()
      alert(`Saved version v${nextVersion}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save'
      alert(msg)
    } finally {
      setBusy(false)
    }
  }

  async function exportHtml() {
    if (!editor) return
    const html = editor.getHtml() ?? ''
    const css = editor.getCss() ?? ''
    const htmlDoc = buildHtmlDocument(html, css)
    await navigator.clipboard.writeText(htmlDoc)
    alert('Copied full HTML document to clipboard')
  }

  async function loadVersion(v: TemplateVersion) {
    if (!editor) return
    if (!confirm(`Load version v${v.version}? Unsaved changes will be lost.`)) return
    if (v.design_json) {
      editor.loadProjectData(v.design_json)
    } else {
      alert('This version has no saved design_json')
    }
  }

  if (!loading && !user) {
    return (
      <main className="min-h-screen p-10">
        <div className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-semibold">Template editor</h1>
          <p className="text-gray-600">You need to sign in first.</p>
          <Link className="rounded bg-black px-4 py-2 text-white" href="/login">
            Go to login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Link className="text-sm underline" href="/templates">
                ← Back
              </Link>
              <h1 className="text-xl font-semibold">{template?.name ?? 'Template'}</h1>
            </div>
            <p className="text-sm text-gray-600">
              {user?.email} • {templateId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded border px-3 py-2"
              onClick={() => setShareOpen(true)}
              disabled={!canEdit}
              title="Only the owner can share (enforced by RLS)"
            >
              Share
            </button>
            <button className="rounded border px-3 py-2" onClick={exportHtml} disabled={!editor}>
              Copy HTML
            </button>
            <button
              className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
              onClick={saveNewVersion}
              disabled={!editor || busy}
              title="Saves a new version and updates current_html/current_design_json"
            >
              Save version
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <GrapesEditor
              initialProjectData={(template?.current_design_json as ProjectData | null) ?? null}
              onReady={(ed) => setEditor(ed)}
            />
          </div>
          <aside className="rounded border p-3">
            <div className="mb-2 text-sm font-medium">Version history</div>
            <div className="space-y-2">
              {versions.map((v) => (
                <button
                  key={v.id}
                  className="w-full rounded border px-3 py-2 text-left text-sm hover:bg-gray-50"
                  onClick={() => loadVersion(v)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">v{v.version}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(v.created_at).toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
              {!versions.length && (
                <p className="text-sm text-gray-600">No versions yet. Save one.</p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ShareModal
        open={shareOpen}
        templateId={templateId}
        onClose={() => {
          setShareOpen(false)
          load().catch(() => {})
        }}
      />
    </main>
  )
}
