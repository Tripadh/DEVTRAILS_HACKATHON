import { useEffect, useMemo, useState } from 'react'
import AlertCard from '../components/AlertCard'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import { fetchDashboard } from '../services/gigshieldApi'
import './InsurerDashboardPage.css'

function InsurerDashboardPage({ user }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchDashboard(user.role, user).then(setData)
  }, [user])

  const triggeredCount = useMemo(() => {
    if (!data) {
      return 0
    }

    return data.liveAlerts.filter((alert) => alert.status === 'Triggered').length
  }, [data])

  if (!data) {
    return <p className="surface-card p-6 text-slate-600">Loading insurer dashboard...</p>
  }

  return (
    <div className="page-shell insurer-dashboard">
      <section className="surface-card insurer-dashboard__hero overflow-hidden border border-slate-200/90 p-0">
        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Insurer Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">
              Portfolio Overview, {user.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Review risk intensity, claim pressure, and settlement momentum before payout execution.
            </p>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Payout Readiness</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">AI decision</p>
                <div className="mt-1">
                  <StatusPill status={data.aiDecision} />
                </div>
              </div>
              <div className="insurer-dashboard__orb h-12 w-12 rounded-xl" />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
              Triggered alerts: {triggeredCount}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Auto Payouts" value={data.totalPayouts} hint="Settled portfolio value" />
        <StatCard title="Coverage" value={data.coverageStatus} hint="Underwriting health" />
        <StatCard title="Live Alerts" value={String(data.liveAlerts.length)} hint="Event-driven cases" />
        <StatCard title="Triggered" value={String(triggeredCount)} hint="High priority claims" />
      </section>

      <section className="surface-card p-5">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">Risk Event Pipeline</h2>
            <p className="section-subtitle">Signals currently impacting insurer payout decisions.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {data.liveAlerts.length} tracked
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.liveAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default InsurerDashboardPage
