function StatusPill({ status }) {
  const tone =
    status === 'Active' || status === 'Auto Approved' || status === 'Passed'
      ? 'bg-emerald-100/90 text-emerald-800 ring-1 ring-emerald-200'
      : status === 'Triggered' || status === 'High'
        ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200'
        : status === 'Processing' || status === 'Monitoring'
          ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-200'
          : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

export default StatusPill
