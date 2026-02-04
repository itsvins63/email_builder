import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-semibold">Email Builder</h1>
        <p className="text-gray-600">
          Build and version email templates with GrapesJS. Sign in to continue.
        </p>
        <div className="flex gap-3">
          <Link
            className="rounded bg-black px-4 py-2 text-white"
            href="/login"
          >
            Login
          </Link>
          <Link
            className="rounded border px-4 py-2"
            href="/templates"
          >
            Go to templates
          </Link>
        </div>
      </div>
    </main>
  )
}
