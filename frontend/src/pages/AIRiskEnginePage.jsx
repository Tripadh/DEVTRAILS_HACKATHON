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
      <div className="surface-card p-5">
        <h1 className="section-title">AI Risk Engine</h1>
        <p className="section-subtitle">Decisioning and fraud checks for auto payouts.</p>
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
            Risk and fraud thresholds are currently favorable for automatic approvals.
          </p>
        </article>

        <article className="surface-card p-4">
          <h2 className="text-lg font-semibold text-slate-900">Next System Action</h2>
          <p className="mt-2 text-sm text-slate-600">
            Continue monitoring trigger intensity and queue settlement for active regions.
          </p>
        </article>
      </div>
    </section>
  )
}

export default AIRiskEnginePage
