import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { fetchAiSnapshot } from '../services/gigshieldApi'

function AIRiskEnginePage() {
  const [snapshot, setSnapshot] = useState(null)

  useEffect(() => {
    fetchAiSnapshot().then(setSnapshot)
  }, [])

  if (!snapshot) {
    return <p className="surface-card p-6 text-slate-600">Loading AI summary...</p>
  }

  return (
    <section className="page-shell">
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 px-6 py-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">AI Risk Engine</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Decisioning and route warnings for auto payouts</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Personalized AI summary, current risk status, and upcoming warnings for the signed-in worker zone.
          </p>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Worker Context</h2>
            <p className="section-subtitle">AI summary based on the current user profile and weather stream.</p>
          </div>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            {snapshot.workerLocation || 'Location loading'}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <StatCard title="Worker" value={snapshot.workerName || 'Gig Worker'} hint={snapshot.userSummary} />
          <StatCard title="Risk" value={snapshot.workerRisk} hint={snapshot.currentAdvisory} />
          <StatCard title="Zone" value={snapshot.zoneSeverity} hint={snapshot.workerLocation || 'Zone not set'} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Worker Risk Score" value={snapshot.workerRisk} />
        <StatCard title="Zone Severity" value={snapshot.zoneSeverity} />
        <StatCard title="Fraud Check" value={snapshot.fraudCheck} />
        <StatCard title="Payout Confidence" value={snapshot.payoutConfidence} />
        <StatCard title="Decision" value={snapshot.decision} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <article className="surface-card p-4">
          <h2 className="text-lg font-semibold text-slate-900">Decision Notes</h2>
          <p className="mt-2 text-sm text-slate-600">
            {snapshot.currentAdvisory}
          </p>
        </article>

        <article className="surface-card p-4">
          <h2 className="text-lg font-semibold text-slate-900">Next System Action</h2>
          <p className="mt-2 text-sm text-slate-600">
            Continue monitoring trigger intensity and queue settlement for {snapshot.workerLocation || 'the active zone'}.
          </p>
        </article>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">Upcoming Warnings</h2>
            <p className="section-subtitle">Curfew, weather, and route alerts for the worker zone.</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {snapshot.upcomingWarnings?.length || 0} items
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {(snapshot.upcomingWarnings || []).map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.title}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.window}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.severity === 'High' ? 'bg-rose-50 text-rose-700' : item.severity === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {item.severity}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="section-title">Recent Signals</h2>
            <p className="section-subtitle">Recent weather and disruption signals used by the AI model.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(snapshot.recentSignals || []).map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.title}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.window}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
              <p className="mt-3 text-xs font-semibold text-slate-500">Severity: {item.severity}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AIRiskEnginePage
