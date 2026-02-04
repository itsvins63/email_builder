import Link from 'next/link'
import { BrandMark } from '@/components/brand'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between">
          <BrandMark />
          <div className="flex gap-2">
            <Link
              href="/login"
              className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/templates"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-950"
            >
              Go to templates
            </Link>
          </div>
        </header>

        <section className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
              Build beautiful email templates
              <span className="text-slate-500"> fast.</span>
            </h1>
            <p className="mt-4 max-w-prose text-base text-slate-600">
              A clean internal editor with version history, sharing, HTML export,
              and responsive previews.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/templates"
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open templates
              </Link>
              <Link
                href="/demo/editor"
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
              >
                View editor demo
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <div className="rounded-xl border bg-white p-4">
                <div className="font-medium text-slate-900">Version history</div>
                <div className="mt-1 text-xs">Every save creates a new version.</div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="font-medium text-slate-900">Sharing</div>
                <div className="mt-1 text-xs">Invite viewers/editors.</div>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <div className="font-medium text-slate-900">Export HTML</div>
                <div className="mt-1 text-xs">Copy clean output instantly.</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="rounded-xl border bg-slate-50 p-6">
              <div className="text-xs font-medium text-slate-500">Preview</div>
              <div className="mt-4 rounded-xl border bg-white p-5">
                <div className="h-3 w-32 rounded bg-slate-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-11/12 rounded bg-slate-100" />
                  <div className="h-3 w-10/12 rounded bg-slate-100" />
                </div>
                <div className="mt-5 inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">
                  Button
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-xs text-slate-500">
          Built with Next.js + Supabase + GrapesJS.
        </footer>
      </div>
    </main>
  )
}
