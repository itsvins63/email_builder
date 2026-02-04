'use client'

import { useState } from 'react'
import type { Editor } from 'grapesjs'
import GrapesEditor from '@/components/GrapesEditor'

export default function DemoEditorPage() {
  const [editor, setEditor] = useState<Editor | null>(null)

  return (
    <main className="p-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Demo Editor</h1>
          <div className="text-xs text-muted-foreground">
            This route is for CI screenshots (no auth).
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => editor?.runCommand('preview')}
            className="rounded border px-3 py-2 text-sm"
            disabled={!editor}
          >
            Preview
          </button>
          <button
            onClick={() => editor?.setDevice('Desktop')}
            className="rounded border px-3 py-2 text-sm"
            disabled={!editor}
          >
            Desktop
          </button>
          <button
            onClick={() => editor?.setDevice('Mobile')}
            className="rounded border px-3 py-2 text-sm"
            disabled={!editor}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-6xl">
        <div className="rounded border">
          <GrapesEditor
            onReady={setEditor}
            initialProjectData={null}
          />
        </div>
      </div>
    </main>
  )
}
