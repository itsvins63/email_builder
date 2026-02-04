'use client'

import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type AuthCtx = {
  user: User | null
  session: Session | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase().auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase().auth.onAuthStateChange((_evt, sess) => {
      setSession(sess)
      setLoading(false)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({ user: session?.user ?? null, session, loading }),
    [session, loading]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
