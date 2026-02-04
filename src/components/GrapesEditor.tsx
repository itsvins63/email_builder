'use client'

import 'grapesjs/dist/css/grapes.min.css'

import grapesjs, { type Editor } from 'grapesjs'
import { useEffect, useRef } from 'react'

type Props = {
  initialProjectData?: any
  onReady?: (editor: Editor) => void
}

export default function GrapesEditor({ initialProjectData, onReady }: Props) {
  const elRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    if (!elRef.current) return
    if (editorRef.current) return

    const editor = grapesjs.init({
      container: elRef.current,
      height: 'calc(100vh - 160px)',
      fromElement: false,
      storageManager: false,
      panels: { defaults: [] },
    })

    // Minimal blocks for email-like layouts
    const bm = editor.BlockManager
    bm.add('section', {
      label: 'Section',
      content:
        '<section style="padding:20px;"><div style="max-width:600px;margin:0 auto;"></div></section>',
    })
    bm.add('text', {
      label: 'Text',
      content: '<p style="font-family:Arial; font-size:14px;">Your text here</p>',
    })
    bm.add('button', {
      label: 'Button',
      content:
        '<a href="#" style="display:inline-block;background:#111;color:#fff;padding:12px 16px;border-radius:6px;text-decoration:none;font-family:Arial;">Button</a>',
    })
    bm.add('image', {
      label: 'Image',
      content: '<img alt="" src="https://placehold.co/600x200" style="max-width:100%;"/>',
    })

    editor.Panels.addPanel({
      id: 'basic-actions',
      el: '.gjs-pn-panels',
      buttons: [],
    })

    if (initialProjectData) {
      try {
        editor.loadProjectData(initialProjectData)
      } catch {
        // ignore invalid data
      }
    }

    editorRef.current = editor
    onReady?.(editor)

    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={elRef} />
}
