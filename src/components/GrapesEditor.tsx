'use client'

import 'grapesjs/dist/css/grapes.min.css'

import grapesjs, { type Editor, type ProjectData } from 'grapesjs'
import { useEffect, useRef } from 'react'

type Props = {
  initialProjectData?: unknown
  onReady?: (editor: Editor) => void
}

export default function GrapesEditor({ initialProjectData, onReady }: Props) {
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<Editor | null>(null)

  const topbarRef = useRef<HTMLDivElement | null>(null)
  const blocksRef = useRef<HTMLDivElement | null>(null)
  const layersRef = useRef<HTMLDivElement | null>(null)
  const stylesRef = useRef<HTMLDivElement | null>(null)
  const traitsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (editorRef.current) return

    const editor = grapesjs.init({
      container: canvasRef.current,
      height: '100%',
      fromElement: false,
      storageManager: false,
      selectorManager: { appendTo: stylesRef.current || undefined },
      styleManager: {
        appendTo: stylesRef.current || undefined,
        sectors: [
          {
            name: 'Typography',
            open: true,
            buildProps: ['font-family', 'font-size', 'font-weight', 'color', 'line-height', 'text-align'],
          },
          {
            name: 'Spacing',
            open: false,
            buildProps: ['padding', 'margin'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['background-color', 'border', 'border-radius'],
          },
        ],
      },
      layerManager: { appendTo: layersRef.current || undefined },
      traitManager: { appendTo: traitsRef.current || undefined },
      blockManager: { appendTo: blocksRef.current || undefined },
      panels: { defaults: [] },
    })

    // Topbar buttons
    editor.Panels.addPanel({
      id: 'topbar',
      el: topbarRef.current || undefined,
      buttons: [
        {
          id: 'preview',
          label: 'Preview',
          command: 'preview',
          togglable: true,
        },
        {
          id: 'fullscreen',
          label: 'Full',
          command: 'fullscreen',
          togglable: true,
        },
        {
          id: 'undo',
          label: 'Undo',
          command: 'core:undo',
        },
        {
          id: 'redo',
          label: 'Redo',
          command: 'core:redo',
        },
      ],
    })

    // Basic blocks (email-ish)
    const bm = editor.BlockManager
    bm.add('section', {
      label: 'Section',
      category: 'Layout',
      content:
        '<section style="padding:20px;"><div style="max-width:600px;margin:0 auto;"></div></section>',
    })
    bm.add('2col', {
      label: '2 Columns',
      category: 'Layout',
      content: `
        <div style="display:flex; gap:16px;">
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Column</div>
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Column</div>
        </div>
      `,
    })
    bm.add('spacer', {
      label: 'Spacer',
      category: 'Basic',
      content: '<div style="height:20px;"></div>',
    })
    bm.add('divider', {
      label: 'Divider',
      category: 'Basic',
      content: '<hr style="border:none;border-top:1px solid #e5e5e5;"/>',
    })
    bm.add('text', {
      label: 'Text',
      category: 'Basic',
      content: '<p style="font-family:Arial; font-size:14px;">Your text here</p>',
    })
    bm.add('button', {
      label: 'Button',
      category: 'Basic',
      content:
        '<a href="#" style="display:inline-block;background:#111;color:#fff;padding:12px 16px;border-radius:6px;text-decoration:none;font-family:Arial;">Button</a>',
    })
    bm.add('image', {
      label: 'Image',
      category: 'Basic',
      content: '<img alt="" src="https://placehold.co/600x200" style="max-width:100%;"/>',
    })

    // Load initial data
    if (initialProjectData) {
      try {
        editor.loadProjectData(initialProjectData as ProjectData)
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

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[560px] w-full flex-col">
      <div
        ref={topbarRef}
        className="gjs-pn-panels gjs-one-bg flex items-center gap-2 border-b px-2 py-1"
      />

      <div className="flex min-h-0 flex-1">
        <div className="w-64 shrink-0 border-r">
          <div className="border-b px-3 py-2 text-xs font-medium">Blocks</div>
          <div ref={blocksRef} className="h-full overflow-auto p-2" />
        </div>

        <div className="min-w-0 flex-1">
          <div ref={canvasRef} className="h-full" />
        </div>

        <div className="w-72 shrink-0 border-l">
          <div className="border-b px-3 py-2 text-xs font-medium">Layers</div>
          <div ref={layersRef} className="h-48 overflow-auto p-2" />
          <div className="border-b px-3 py-2 text-xs font-medium">Styles</div>
          <div ref={stylesRef} className="h-64 overflow-auto p-2" />
          <div className="border-b px-3 py-2 text-xs font-medium">Traits</div>
          <div ref={traitsRef} className="h-48 overflow-auto p-2" />
        </div>
      </div>
    </div>
  )
}
