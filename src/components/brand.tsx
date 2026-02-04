export function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
        <span className="text-sm font-semibold">EB</span>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold tracking-tight">Email Builder</div>
        <div className="text-xs text-slate-500">Internal templates</div>
      </div>
    </div>
  )
}
