import { useEffect, useState } from 'react'
import AlertCard from '../components/AlertCard'
import StatCard from '../components/StatCard'
import { fetchAlerts } from '../services/gigshieldApi'

function TriggerMonitorPage() {
  const [rows, setRows] = useState([])

  useEffect(() => {
    fetchAlerts().then(setRows)
  }, [])

  return (
    <section className="page-shell">
      <div className="surface-card p-5">
        <h1 className="section-title">Live Risk Alerts</h1>
        <p className="section-subtitle">
          Rain, heat, curfew, flood, and cyclone triggers across active zones.
        </p>
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
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TriggerMonitorPage
