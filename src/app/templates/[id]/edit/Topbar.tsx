'use client'

import { useEffect, useState } from 'react'

export function formatRelativeTime(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const s = Math.round(diffMs / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  return `${h}h ago`
}

export function RelativeTime({ iso }: { iso: string | null }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!iso) return
    const t = setInterval(() => setTick((x) => x + 1), 10_000)
    return () => clearInterval(t)
  }, [iso])

  if (!iso) return null
  return <span>{formatRelativeTime(iso)}{tick ? '' : ''}</span>
}
