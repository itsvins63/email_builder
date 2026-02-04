import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function CardButton({
  title,
  icon,
  onClick,
}: {
  title: string
  icon: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded border bg-white px-2 py-3 text-xs hover:bg-slate-50"
    >
      <span className="text-slate-800">{icon}</span>
      <span className="text-slate-700">{title}</span>
    </button>
  )
}

export function PrimaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode },
) {
  const { className, ...rest } = props
  return (
    <button
      {...rest}
      className={clsx(
        'rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60',
        className,
      )}
    />
  )
}

export function SecondaryButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode },
) {
  const { className, ...rest } = props
  return (
    <button
      {...rest}
      className={clsx(
        'rounded border bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-60',
        className,
      )}
    />
  )
}
