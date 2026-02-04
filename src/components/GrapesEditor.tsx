'use client'

import 'grapesjs/dist/css/grapes.min.css'

import grapesjs, { type Editor, type ProjectData } from 'grapesjs'
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { CardButton } from '@/components/ui'
import {
  ButtonIcon,
  DividerIcon,
  ImageIcon,
  LayersIcon,
  LayoutIcon,
  SlidersIcon,
  TagIcon,
  TextIcon,
} from '@/components/icons'

type Props = {
  initialProjectData?: unknown
  onReady?: (editor: Editor) => void
}

type RightTab = 'layers' | 'styles' | 'traits'

type BlockTile = {
  id: string
  title: string
  icon: ReactElement
}

const BLOCK_TILES: BlockTile[] = [
  { id: 'text', title: 'Text', icon: <TextIcon /> },
  { id: 'image', title: 'Image', icon: <ImageIcon /> },
  { id: 'button', title: 'Button', icon: <ButtonIcon /> },
  { id: 'divider', title: 'Divider', icon: <DividerIcon /> },
  { id: 'section', title: 'Section', icon: <LayoutIcon /> },
  { id: '2col', title: '2 Columns', icon: <LayoutIcon /> },
]

export default function GrapesEditor({ initialProjectData, onReady }: Props) {
  const editorRef = useRef<Editor | null>(null)

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const leftBlocksRef = useRef<HTMLDivElement | null>(null)

  const rightLayersRef = useRef<HTMLDivElement | null>(null)
  const rightStylesRef = useRef<HTMLDivElement | null>(null)
  const rightTraitsRef = useRef<HTMLDivElement | null>(null)

  const [tab, setTab] = useState<RightTab>('styles')

  const canInit = useMemo(
    () => Boolean(canvasRef.current && leftBlocksRef.current),
    [],
  )

  useEffect(() => {
    if (!canvasRef.current) return
    if (!leftBlocksRef.current) return
    if (editorRef.current) return

    const editor = grapesjs.init({
      container: canvasRef.current,
      height: '100%',
      fromElement: false,
      storageManager: false,
      panels: { defaults: [] },
      blockManager: { appendTo: leftBlocksRef.current },
      layerManager: { appendTo: rightLayersRef.current || undefined },
      selectorManager: { appendTo: rightStylesRef.current || undefined },
      styleManager: {
        appendTo: rightStylesRef.current || undefined,
        sectors: [
          {
            name: 'Typography',
            open: true,
            buildProps: [
              'font-family',
              'font-size',
              'font-weight',
              'color',
              'line-height',
              'text-align',
            ],
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
      traitManager: { appendTo: rightTraitsRef.current || undefined },
    })

    // Keep email-ish width / background like the reference
    editor.Canvas.getDocument().body.style.background = '#f6f7fb'

    // Blocks
    const bm = editor.BlockManager
    bm.add('section', {
      label: 'Section',
      category: 'Layout',
      content:
        '<section style="padding:20px;"><div style="max-width:600px;margin:0 auto;background:#fff;padding:16px;"></div></section>',
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
    bm.add('divider', {
      label: 'Divider',
      category: 'Basic',
      content: '<hr style="border:none;border-top:1px solid #e5e5e5;"/>',
    })

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
  }, [canInit])

  function addBlock(id: string) {
    const ed = editorRef.current
    if (!ed) return
    const block = ed.BlockManager.get(id)
    if (!block) return
    // Insert block content into canvas
    const content = block.get('content')
    if (content) ed.addComponents(content)
  }

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px] w-full min-w-0 border bg-slate-50">
      {/* Left: Elements */}
      <div className="w-[260px] shrink-0 border-r bg-white">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">Elements</div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {BLOCK_TILES.map((t) => (
              <CardButton
                key={t.id}
                title={t.title}
                icon={t.icon}
                onClick={() => addBlock(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Hidden Grapes block list (kept for internal registrations) */}
        <div ref={leftBlocksRef} className="hidden" />
      </div>

      {/* Center: Canvas */}
      <div className="min-w-0 flex-1 p-6">
        <div className="mx-auto h-full max-w-[980px] rounded bg-white shadow-sm">
          <div ref={canvasRef} className="h-full" />
        </div>
      </div>

      {/* Right: Single panel w/ tabs */}
      <div className="w-[320px] shrink-0 border-l bg-white">
        <div className="flex items-center gap-1 border-b p-2">
          <button
            type="button"
            onClick={() => setTab('layers')}
            className={`rounded px-2 py-2 text-slate-700 hover:bg-slate-50 ${tab === 'layers' ? 'bg-slate-100' : ''}`}
            title="Layers"
          >
            <LayersIcon />
          </button>
          <button
            type="button"
            onClick={() => setTab('styles')}
            className={`rounded px-2 py-2 text-slate-700 hover:bg-slate-50 ${tab === 'styles' ? 'bg-slate-100' : ''}`}
            title="Styles"
          >
            <SlidersIcon />
          </button>
          <button
            type="button"
            onClick={() => setTab('traits')}
            className={`rounded px-2 py-2 text-slate-700 hover:bg-slate-50 ${tab === 'traits' ? 'bg-slate-100' : ''}`}
            title="Settings"
          >
            <TagIcon />
          </button>
        </div>

        <div className="h-full overflow-auto p-3">
          <div className={tab === 'layers' ? '' : 'hidden'}>
            <div ref={rightLayersRef} />
          </div>
          <div className={tab === 'styles' ? '' : 'hidden'}>
            <div ref={rightStylesRef} />
          </div>
          <div className={tab === 'traits' ? '' : 'hidden'}>
            <div ref={rightTraitsRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
