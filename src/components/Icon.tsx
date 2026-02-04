import type { ReactNode } from 'react'

export function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded border bg-white">
      {children}
    </span>
  )
}
