import { useEffect, useMemo, useState } from 'react'
import AlertCard from '../components/AlertCard'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import { fetchDashboard } from '../services/gigshieldApi'
import './OpsDashboardPage.css'

function OpsDashboardPage({ user }) {
  const [data, setData] = useState(null)

  const operationsSnapshot = [
    {
      id: 'reg-queue',
      title: 'Worker onboarding queue',
      value: '3 pending',
      hint: '2 verified, 1 waiting for city/location confirmation',
    },
    {
      id: 'zone-watch',
      title: 'Active zone watchlist',
      value: 'South Bengaluru',
      hint: 'Heavy rain and curfew checks enabled',
    },
    {
      id: 'payouts',
      title: 'Payout review',
      value: '6 auto-approved',
      hint: '1 claim awaiting manual review',
    },
    {
      id: 'escalations',
      title: 'Escalations today',
      value: '2 alerts',
      hint: 'Cyclone and flood watch in effect',
    },
  ]

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
    return <p className="surface-card p-6 text-slate-600">Loading operations dashboard...</p>
  }

  return (
    <div className="page-shell ops-dashboard">
      <section className="surface-card ops-dashboard__hero overflow-hidden border border-slate-200/90 p-0">
        <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Operations Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">
              Control Center, {user.name}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">
              Monitor active risk events, onboarding readiness, and trigger response across all managed zones.
            </p>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Ops Health</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Coverage status</p>
                <div className="mt-1">
                  <StatusPill status={data.coverageStatus} />
                </div>
              </div>
              <div className="ops-dashboard__orb h-12 w-12 rounded-xl" />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600">
              Triggered alerts: {triggeredCount}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Coverage" value={data.coverageStatus} hint="Current program state" />
        <StatCard title="Managed Zone" value={data.worker.zone} hint="Primary operations zone" />
        <StatCard title="Live Alerts" value={String(data.liveAlerts.length)} hint="Signals in queue" />
        <StatCard title="Triggered" value={String(triggeredCount)} hint="Needs immediate action" />
      </section>

      <section className="surface-card p-5">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">Operations Snapshot</h2>
            <p className="section-subtitle">Static queue data plus live coverage context for the ops desk.</p>
          </div>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            Live + static
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {operationsSnapshot.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.title}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.hint}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">Operations Alert Feed</h2>
            <p className="section-subtitle">Prioritize triggered zones before payout cycles begin.</p>
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

export default OpsDashboardPage
