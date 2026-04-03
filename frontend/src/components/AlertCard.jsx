import StatusPill from './StatusPill'

function AlertCard({ alert }) {
  const iconMap = {
    'Heavy Rain': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 18c0 .5-.4 1-1 1a1 1 0 0 1-1-1" />
        <path d="M12 18c0 .5-.4 1-1 1a1 1 0 0 1-1-1" />
        <path d="M17 18c0 .5-.4 1-1 1a1 1 0 0 1-1-1" />
        <path d="M12 3v9" />
        <path d="M6 9l6-6 6 6" />
      </svg>
    ),
    'Extreme Heat': (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </svg>
    ),
    Curfew: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    Flood: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
        <path d="M3 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2" />
        <path d="M12 3v7" />
      </svg>
    ),
    Cyclone: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" />
        <path d="M12 8c2.2 0 4 1.8 4 4s-1.8 4-4 4-4-1.8-4-4" />
      </svg>
    ),
  }

  const statusTone =
    alert.status === 'Triggered'
      ? 'border-amber-200 bg-amber-50 text-amber-800'
      : alert.status === 'Monitoring'
        ? 'border-blue-200 bg-blue-50 text-blue-800'
        : 'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <article className="surface-card p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${statusTone}`}>
            {iconMap[alert.type]}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{alert.type} Trigger</h3>
            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{alert.zone}</p>
          </div>
        </div>
        <StatusPill status={alert.status} />
      </div>
      <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="flex items-center justify-between gap-3">
          <span>Zone</span>
          <span className="font-semibold text-slate-900">{alert.zone}</span>
        </p>
        <p className="flex items-center justify-between gap-3">
          <span>Potential payout</span>
          <span className="font-semibold text-slate-900">{alert.payout}</span>
        </p>
      </div>
    </article>
  )
}

export default AlertCard
