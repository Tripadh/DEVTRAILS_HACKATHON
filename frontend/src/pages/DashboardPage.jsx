import { useEffect, useState } from 'react'
import AlertCard from '../components/AlertCard'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import { fetchDashboard } from '../services/gigshieldApi'

function DashboardPage({ user }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchDashboard(user.role).then(setData)
  }, [user.role])

  if (!data) {
    return <p className="surface-card p-6 text-slate-600">Loading dashboard...</p>
  }

  return (
    <div className="page-shell">
      <section className="surface-card overflow-hidden p-0">
        <div className="grid gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 px-6 py-6 text-white md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">
              Welcome back, {data.worker.name}
            </h1>
            <p className="mt-2 text-sm text-slate-200">
              Monitor live triggers, coverage status, and payout readiness in one place.
            </p>
            {user.role === 'worker' && user.company && (
              <p className="mt-3 text-sm text-cyan-100">
                Company: {user.company}
                {user.workerCompanyId ? ` | Worker ID: ${user.workerCompanyId}` : ''}
              </p>
            )}
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <div className="rounded-2xl border border-white/25 bg-white/10 p-4 text-sm backdrop-blur">
              <p className="text-slate-200">Coverage Status</p>
              <div className="mt-2">
                <StatusPill status={data.coverageStatus} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Coverage" value={data.coverageStatus} />
        <StatCard title="Current Zone" value={data.worker.zone} />
        <StatCard title="Role" value={user.roleLabel} />
        <StatCard title="Total Auto Payouts" value={data.totalPayouts} />
      </section>

      <section className="surface-card p-5">
        <h2 className="section-title">Live Risk Alerts</h2>
        <p className="section-subtitle">
          Event signals from monitored cities and zones.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.liveAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <h2 className="section-title">AI Decision Status</h2>
        <p className="section-subtitle">Current decision pipeline for active triggers.</p>
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm text-slate-600">Current decision</p>
          <p className="text-xl font-semibold text-slate-900">{data.aiDecision}</p>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
