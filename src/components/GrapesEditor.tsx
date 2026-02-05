'use client'

import 'grapesjs/dist/css/grapes.min.css'

import grapesjs, { type Editor, type ProjectData } from 'grapesjs'
import { useEffect, useRef, useState } from 'react'
import { LayersIcon, SlidersIcon, TagIcon } from '@/components/icons'

type Props = {
  initialProjectData?: unknown
  onReady?: (editor: Editor) => void
}

type RightTab = 'layers' | 'styles' | 'traits'

export default function GrapesEditor({ initialProjectData, onReady }: Props) {
  const editorRef = useRef<Editor | null>(null)

  const canvasRef = useRef<HTMLDivElement | null>(null)
  const leftBlocksRef = useRef<HTMLDivElement | null>(null)

  const rightLayersRef = useRef<HTMLDivElement | null>(null)
  const rightStylesRef = useRef<HTMLDivElement | null>(null)
  const rightTraitsRef = useRef<HTMLDivElement | null>(null)

  const [tab, setTab] = useState<RightTab>('styles')

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
      deviceManager: {
        devices: [
          { id: 'Desktop', name: 'Desktop', width: '' },
          { id: 'Mobile', name: 'Mobile', width: '375px' },
        ],
      },
      canvas: {
        styles: [
          'body{margin:0;background:#f6f7fb;font-family:Arial, sans-serif;}',
          '.email-root{max-width:920px;margin:16px auto;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.06);border:1px solid #e5e7eb;min-height:640px;}',
          '.email-pad{padding:20px;}',
        ],
      },
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

    // Blocks
    const bm = editor.BlockManager

    // Ensure a visible email body container
    editor.on('load', () => {
      const wrapper = editor.getWrapper()
      if (!wrapper?.components()?.length) {
        editor.setComponents(
          '<div class="email-root"><div class="email-pad"><p style="font-size:14px;">Start building…</p></div></div>',
        )
      }
      editor.setDevice('Desktop')

      // Make categories collapsible (accordion)
      const root = leftBlocksRef.current
      if (!root) return

      // Make categories collapsible (but keep expanded by default)
      const categories = Array.from(
        root.querySelectorAll<HTMLElement>('.gjs-block-category'),
      )

      categories.forEach((cat) => {
        // Find the title element reliably across GrapesJS versions
        const titleEl =
          cat.querySelector<HTMLElement>('.gjs-title') ||
          cat.querySelector<HTMLElement>('.gjs-block-category-title') ||
          cat.querySelector<HTMLElement>('.gjs-category-title') ||
          cat.querySelector<HTMLElement>('[class*="title"]')

        if (!titleEl) return

        const t = titleEl as HTMLElement & { __oc_bound?: boolean }
        if (t.__oc_bound) return

        t.__oc_bound = true
        t.style.cursor = 'pointer'
        t.addEventListener('click', () => {
          cat.classList.toggle('oc-cat-collapsed')
        })
      })
    })

    // Layout
    bm.add('layout_section', {
      label: 'Section',
      category: 'Layout',
      content:
        '<section class="email-pad"><div style="max-width:920px;margin:0 auto;"></div></section>',
    })

    // Email blocks (reference-style)
    bm.add('email_header', {
      label: 'Header',
      category: 'Email',
      content: `
        <div class="email-pad">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:10px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;font-family:Arial;font-weight:700;">L</div>
              <div style="font-family:Arial;font-weight:700;color:#0f172a;">Your Brand</div>
            </div>
            <div style="display:flex;gap:14px;font-family:Arial;font-size:13px;color:#334155;">
              <a href="#" style="color:#334155;text-decoration:none;">Product</a>
              <a href="#" style="color:#334155;text-decoration:none;">Pricing</a>
              <a href="#" style="color:#334155;text-decoration:none;">Docs</a>
            </div>
          </div>
        </div>
      `,
    })

    bm.add('email_hero', {
      label: 'Hero',
      category: 'Email',
      content: `
        <div class="email-pad">
          <div style="border:1px solid #e5e7eb;border-radius:16px;padding:22px;background:#ffffff;">
            <div style="font-family:Arial;font-size:12px;color:#64748b;">NEW</div>
            <h1 style="font-family:Arial;font-size:28px;line-height:1.2;margin:10px 0 8px;color:#0f172a;">A short, clear hero headline</h1>
            <p style="font-family:Arial;font-size:14px;line-height:1.6;margin:0 0 14px;color:#475569;">Use this section to summarize the email and drive a single action.</p>
            <a href="#" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 16px;border-radius:12px;text-decoration:none;font-family:Arial;font-weight:600;">Primary CTA</a>
          </div>
        </div>
      `,
    })

    bm.add('email_features_3', {
      label: 'Features (3)',
      category: 'Email',
      content: `
        <div class="email-pad">
          <div style="display:flex;gap:12px;">
            <div style="flex:1;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
              <div style="font-family:Arial;font-weight:700;color:#0f172a;">Feature</div>
              <div style="margin-top:6px;font-family:Arial;font-size:13px;color:#475569;">Describe the benefit in one line.</div>
            </div>
            <div style="flex:1;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
              <div style="font-family:Arial;font-weight:700;color:#0f172a;">Feature</div>
              <div style="margin-top:6px;font-family:Arial;font-size:13px;color:#475569;">Describe the benefit in one line.</div>
            </div>
            <div style="flex:1;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
              <div style="font-family:Arial;font-weight:700;color:#0f172a;">Feature</div>
              <div style="margin-top:6px;font-family:Arial;font-size:13px;color:#475569;">Describe the benefit in one line.</div>
            </div>
          </div>
        </div>
      `,
    })

    bm.add('email_cta_band', {
      label: 'CTA Band',
      category: 'Email',
      content: `
        <div class="email-pad">
          <div style="border-radius:16px;padding:18px;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:16px;">
            <div>
              <div style="font-family:Arial;font-weight:700;">Ready to continue?</div>
              <div style="margin-top:4px;font-family:Arial;font-size:13px;color:#cbd5e1;">One line supporting copy goes here.</div>
            </div>
            <a href="#" style="display:inline-block;background:#fff;color:#0f172a;padding:10px 14px;border-radius:12px;text-decoration:none;font-family:Arial;font-weight:700;">Get started</a>
          </div>
        </div>
      `,
    })

    bm.add('email_footer', {
      label: 'Footer',
      category: 'Email',
      content: `
        <div class="email-pad">
          <div style="border-top:1px solid #e5e7eb;padding-top:14px;font-family:Arial;font-size:12px;color:#64748b;">
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a href="#" style="color:#64748b;text-decoration:none;">Help</a>
              <a href="#" style="color:#64748b;text-decoration:none;">Privacy</a>
              <a href="#" style="color:#64748b;text-decoration:none;">Unsubscribe</a>
            </div>
            <div style="margin-top:8px;">© {{year}} Your Company, Address line</div>
          </div>
        </div>
      `,
    })
    bm.add('layout_container', {
      label: 'Container',
      category: 'Layout',
      content:
        '<div style="max-width:920px;margin:0 auto;border:1px dashed #ddd;padding:16px;">Container</div>',
    })
    bm.add('layout_2col', {
      label: '2 Columns',
      category: 'Layout',
      content: `
        <div style="display:flex; gap:16px;">
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Column</div>
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Column</div>
        </div>
      `,
    })
    bm.add('layout_3col', {
      label: '3 Columns',
      category: 'Layout',
      content: `
        <div style="display:flex; gap:12px;">
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Col</div>
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Col</div>
          <div style="flex:1; padding:12px; border:1px dashed #ddd;">Col</div>
        </div>
      `,
    })

    // Basic
    bm.add('basic_heading', {
      label: 'Heading',
      category: 'Basic',
      content:
        '<h2 style="font-family:Arial; font-size:24px; margin:0 0 12px;">Heading</h2>',
    })
    bm.add('basic_text', {
      label: 'Text',
      category: 'Basic',
      content: '<p style="font-family:Arial; font-size:14px;">Your text here</p>',
    })
    bm.add('basic_button', {
      label: 'Button',
      category: 'Basic',
      content:
        '<a href="#" style="display:inline-block;background:#111;color:#fff;padding:12px 16px;border-radius:10px;text-decoration:none;font-family:Arial;">Button</a>',
    })
    bm.add('basic_image', {
      label: 'Image',
      category: 'Basic',
      content:
        '<img alt="" src="https://placehold.co/920x300" style="max-width:100%;border-radius:12px;"/>',
    })
    bm.add('basic_divider', {
      label: 'Divider',
      category: 'Basic',
      content: '<hr style="border:none;border-top:1px solid #e5e5e5;"/>',
    })
    bm.add('basic_spacer', {
      label: 'Spacer',
      category: 'Basic',
      content: '<div style="height:24px;"></div>',
    })

    // Content
    bm.add('content_list', {
      label: 'List',
      category: 'Content',
      content:
        '<ul style="font-family:Arial; font-size:14px; padding-left:18px;"><li>Item one</li><li>Item two</li><li>Item three</li></ul>',
    })
    bm.add('content_quote', {
      label: 'Quote',
      category: 'Content',
      content:
        '<blockquote style="border-left:4px solid #e5e7eb;padding-left:12px;margin:0;color:#334155;font-family:Arial;">A short quote.</blockquote>',
    })

    // Social
    bm.add('social_row', {
      label: 'Social',
      category: 'Social',
      content: `
        <div style="display:flex; gap:10px; align-items:center;">
          <a href="#" style="display:inline-block;width:28px;height:28px;border-radius:8px;background:#111;color:#fff;text-align:center;line-height:28px;font-family:Arial;">in</a>
          <a href="#" style="display:inline-block;width:28px;height:28px;border-radius:8px;background:#111;color:#fff;text-align:center;line-height:28px;font-family:Arial;">X</a>
          <a href="#" style="display:inline-block;width:28px;height:28px;border-radius:8px;background:#111;color:#fff;text-align:center;line-height:28px;font-family:Arial;">f</a>
        </div>
      `,
    })

    // Advanced
    bm.add('advanced_html', {
      label: 'HTML',
      category: 'Advanced',
      content: '<div><!-- Custom HTML --></div>',
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
  }, [])

  return (
    <div className="flex h-[calc(100vh-220px)] min-h-[600px] w-full min-w-0 border bg-slate-50">
      {/* Left: Elements */}
      <div className="w-[300px] shrink-0 border-r bg-white">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="text-sm font-medium">Elements</div>
          <div className="text-xs text-slate-500">Drag into canvas</div>
        </div>

        <div ref={leftBlocksRef} className="gjs-left-blocks h-full overflow-auto p-3" />
      </div>

      {/* Center: Canvas */}
      <div className="min-w-0 flex-1 p-2">
        <div className="h-full w-full rounded bg-white shadow-sm">
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
