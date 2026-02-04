import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">Email Builder</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Build and version email templates. Sign in to get started.
      </p>
      <div className="mt-6">
        <Link
          href="/templates"
          className="inline-flex rounded bg-black px-4 py-2 text-white"
        >
          Go to Templates
        </Link>
      </div>
    </main>
  )
}
