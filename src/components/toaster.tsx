'use client'

import { Toaster } from 'sonner'

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border bg-white text-slate-900 shadow-sm',
          title: 'text-sm font-medium',
          description: 'text-xs text-slate-600',
        },
      }}
    />
  )
}
