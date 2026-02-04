'use client'

import { useEffect, useRef } from 'react'
import type grapesjs from 'grapesjs'
import type { ProjectData } from 'grapesjs'

export type GrapesInstance = ReturnType<typeof grapesjs.init>

export type GrapesEditorProps = {
  initialProjectData: ProjectData | null
  onReady?: (editor: GrapesInstance) => void
}

export default function GrapesEditor({ initialProjectData, onReady }: GrapesEditorProps) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<GrapesInstance | null>(null)

  useEffect(() => {
    let destroyed = false

    async function start() {
      if (!elRef.current) return
      if (editorRef.current) return

      const grapes = (await import('grapesjs')).default

      // Basic blocks for email-ish HTML.
      const editor = grapes.init({
        container: elRef.current,
        height: 'calc(100vh - 140px)',
        fromElement: false,
        storageManager: false,
        selectorManager: { componentFirst: true },
        blockManager: {
          appendTo: '#gjs-blocks',
          blocks: [
            {
              id: 'section',
              label: 'Section',
              content: '<section style="padding:20px;"></section>',
            },
            {
              id: 'text',
              label: 'Text',
              content: '<div style="font-family:Arial, sans-serif; font-size:14px;">Text</div>',
            },
            {
              id: 'button',
              label: 'Button',
              content:
                '<a href="#" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Button</a>',
            },
            {
              id: 'image',
              label: 'Image',
              content: '<img alt="" style="max-width:100%;" />',
            },
          ],
        },
        panels: {
          defaults: [
            {
              id: 'basic-actions',
              el: '.panel__basic-actions',
              buttons: [
                {
                  id: 'undo',
                  className: 'btn-undo',
                  label: 'Undo',
                  command: 'core:undo',
                },
                {
                  id: 'redo',
                  className: 'btn-redo',
                  label: 'Redo',
                  command: 'core:redo',
                },
                {
                  id: 'clean-all',
                  className: 'btn-clean-all',
                  label: 'Clear',
                  command: 'core:canvas-clear',
                },
              ],
            },
          ],
        },
      })

      if (initialProjectData) {
        try {
          editor.loadProjectData(initialProjectData)
        } catch {
          // ignore
        }
      }

      if (destroyed) {
        editor.destroy()
        return
      }

      editorRef.current = editor
      onReady?.(editor)
    }

    start()

    return () => {
      destroyed = true
      if (editorRef.current) {
        editorRef.current.destroy()
        editorRef.current = null
      }
    }
  }, [initialProjectData, onReady])

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[280px_1fr]">
      <div className="rounded border p-3">
        <div className="mb-2 text-sm font-medium">Blocks</div>
        <div id="gjs-blocks" />
      </div>
      <div className="rounded border">
        <div className="panel__basic-actions flex gap-2 border-b p-2 text-sm" />
        <div ref={elRef} />
      </div>
    </div>
  )
}
