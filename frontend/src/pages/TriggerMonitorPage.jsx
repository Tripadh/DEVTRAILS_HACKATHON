import { useEffect, useState } from 'react'
import AlertCard from '../components/AlertCard'
import StatCard from '../components/StatCard'
import { fetchAlerts } from '../services/gigshieldApi'

function TriggerMonitorPage() {
  const [rows, setRows] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState('')

  async function loadAlerts() {
    setRefreshing(true)

    try {
      const alerts = await fetchAlerts()
      setRows(alerts)
      setLastRefreshedAt(new Date().toLocaleTimeString())
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  return (
    <section className="page-shell">
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 px-6 py-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">Automated Triggers</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Live Risk Alerts</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Rain, heat, curfew, flood, and cyclone triggers across active zones.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-right text-xs text-slate-200">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold text-white">
                {refreshing ? 'Refreshing triggers...' : 'Trigger feed active'}
              </span>
              <p>Last refreshed: {lastRefreshedAt || 'just now'}</p>
              <button
                type="button"
                onClick={loadAlerts}
                disabled={refreshing}
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Total Alerts" value={String(rows.length)} />
        <StatCard
          title="Triggered"
          value={String(rows.filter((item) => item.status === 'Triggered').length)}
        />
        <StatCard
          title="Monitoring"
          value={String(rows.filter((item) => item.status === 'Monitoring').length)}
        />
      </div>

      <div className="surface-card p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TriggerMonitorPage
