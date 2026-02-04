'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function LoginClient() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const next = useSearchParams().get('next') || '/templates'

  async function signInWithGoogle() {
    setLoading(true)
    setError(null)

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`

    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="text-sm text-muted-foreground">
        Use Google to sign in. Any Google account is allowed.
      </p>

      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  )
}
