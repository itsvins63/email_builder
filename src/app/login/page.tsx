'use client'

import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace('/templates')
  }, [loading, user, router])

  async function signIn() {
    setBusy(true)
    try {
      const { error } = await supabase().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/templates`
              : undefined,
        },
      })
      if (error) throw error
    } finally {
      setBusy(false)
    }
  }

  async function signOut() {
    setBusy(true)
    try {
      await supabase().auth.signOut()
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen p-10">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Login</h1>

        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : user ? (
          <>
            <p className="text-gray-700">
              Signed in as <span className="font-mono">{user.email}</span>
            </p>
            <button
              className="rounded border px-4 py-2"
              onClick={signOut}
              disabled={busy}
            >
              Sign out
            </button>
          </>
        ) : (
          <button
            className="rounded bg-black px-4 py-2 text-white"
            onClick={signIn}
            disabled={busy}
          >
            Continue with Google
          </button>
        )}

        <p className="text-sm text-gray-500">
          Note: Supabase must have Google OAuth enabled, and your redirect URLs
          must include this site.
        </p>
      </div>
    </main>
  )
}
