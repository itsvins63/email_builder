import { Suspense } from 'react'
import { BrandMark } from '@/components/brand'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-md px-6 py-12">
        <BrandMark />

        <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-slate-600">
            Continue with Google to access your templates.
          </p>

          <div className="mt-6">
            <Suspense>
              <LoginClient />
            </Suspense>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            By continuing, you agree to use this tool for internal template
            building.
          </p>
        </div>
      </div>
    </main>
  )
}
