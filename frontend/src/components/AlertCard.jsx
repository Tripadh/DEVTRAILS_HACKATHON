import StatusPill from './StatusPill'

function AlertCard({ alert }) {
  const iconMap = {
    'Heavy Rain': 'Rain',
    'Extreme Heat': 'Heat',
    Curfew: 'Curfew',
    Flood: 'Flood',
    Cyclone: 'Cyclone',
  }

  return (
    <article className="surface-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">
          {iconMap[alert.type]} Alert
        </h3>
        <StatusPill status={alert.status} />
      </div>
      <div className="mt-3 grid gap-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
        <p>Zone: {alert.zone}</p>
        <p>Potential payout: {alert.payout}</p>
      </div>
    </article>
  )
}

export default AlertCard
