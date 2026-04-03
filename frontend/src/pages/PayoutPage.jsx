import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import { fetchPayouts, simulateTrigger } from '../services/gigshieldApi'

function PayoutPage() {
  const [rows, setRows] = useState([])
  const [simResult, setSimResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [lastRunAt, setLastRunAt] = useState('')

  const historyExampleRows = [
    {
      id: 'demo-rain',
      trigger: 'Heavy Rain',
      signal: 'Rainfall above 65mm/hr for 30+ minutes',
      payout: 'INR 400',
      action: 'Auto-approve and credit payout',
    },
    {
      id: 'demo-flood',
      trigger: 'Urban Flood',
      signal: 'Rainfall + humidity exceed flood threshold',
      payout: 'INR 500',
      action: 'Hold route, trigger worker payout',
    },
    {
      id: 'demo-cyclone',
      trigger: 'Cyclone',
      signal: 'High wind speed with high humidity',
      payout: 'INR 600',
      action: 'Mark high risk and notify workers',
    },
  ]

  async function loadPayouts() {
    const payoutRows = await fetchPayouts()
    setRows(payoutRows)
  }

  useEffect(() => {
    loadPayouts()
  }, [])

  async function handleSimulate() {
    setBusy(true)
    setSimResult(null)

    try {
      const result = await simulateTrigger()
      setSimResult(result)
      setLastRunAt(new Date().toLocaleTimeString())
      await loadPayouts()
    } catch (error) {
      setSimResult({
        payout: false,
        amount: 0,
        riskLevel: 'low',
        source: 'live',
        message: error.message || 'Unable to simulate payout trigger right now.',
      })
    } finally {
      setBusy(false)
    }
  }

  const livePayoutCount = rows.filter((row) => row.status === 'Auto Approved').length
  const processingCount = rows.filter((row) => row.status === 'Processing').length
  const latestPayout = rows[0] || null

  return (
    <div className="page-shell">
      <section className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-900 px-6 py-7 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">ML-backed payouts</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Payout Center</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                Auto-claims, no forms, and fast transfer updates powered by the live weather check and ML payout model.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right text-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-100">Run status</p>
              <p className="mt-1 text-lg font-semibold text-white">{busy ? 'Running live check...' : 'Ready to trigger'}</p>
              <p className="text-xs text-slate-300">{lastRunAt ? `Last run at ${lastRunAt}` : 'No trigger run yet'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard
          title="Auto Approved"
          value={latestPayout?.amount || 'INR 0'}
          hint="Latest approved payout"
        />
        <StatCard title="Processing" value={`INR ${processingCount ? 500 : 0}`} hint="Expected in queue" />
        <StatCard title="Triggered Payouts" value={String(livePayoutCount)} hint="Live ML decisions" />
      </section>

      <section className="surface-card p-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 1</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">Weather check</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">The app calls the live weather endpoint to detect rain, heat, flood, cyclone, or curfew signals.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 2</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">ML payout decision</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">The backend sends the weather snapshot to the FastAPI ML model for payout prediction.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step 3</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">Payout record</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">If approved, the payout is stored in history and shown in the table below.</p>
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Customer experience</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Seamless, zero-touch claim process</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              The best experience for customers is one where they do nothing: the system detects the disruption,
              runs the ML check, and sends the payout automatically.
            </p>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            No forms required
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">01</p>
            <p className="mt-1 text-lg font-bold text-slate-900">Detect automatically</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Weather signals are checked in the background using live or fallback tracking data.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">02</p>
            <p className="mt-1 text-lg font-bold text-slate-900">Approve instantly</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The ML model decides payout eligibility without asking the worker to file a claim.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">03</p>
            <p className="mt-1 text-lg font-bold text-slate-900">Pay without friction</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Money is credited to the saved UPI path, so the customer gets the payout with no extra steps.
            </p>
          </div>
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">History snapshot</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Example payout history</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              These static examples show the expected outcome when the live weather trigger matches a disruption pattern.
            </p>
          </div>
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
            History sample
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {historyExampleRows.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.trigger}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.signal}</p>
              <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Expected payout</span>
                  <span className="font-semibold text-slate-900">{item.payout}</span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-slate-500">Action</span>
                  <span className="max-w-[180px] text-right font-semibold text-slate-900">{item.action}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="surface-card p-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-3 py-2 font-semibold">Event</th>
                  <th className="px-3 py-2 font-semibold">Zone</th>
                  <th className="px-3 py-2 font-semibold">Amount</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{row.event}</td>
                    <td className="px-3 py-2">{row.zone}</td>
                    <td className="px-3 py-2 font-semibold text-slate-900">{row.amount}</td>
                    <td className="px-3 py-2">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulate}
              disabled={busy}
              className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Running live ML check...' : 'Run Live ML Payout'}
            </button>

            <p className="text-sm text-slate-600">
              {simResult?.message || 'No trigger run yet'}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">Flow history</p>
            <p className="mt-2 leading-6">
              The button above performs: weather fetch → ML risk prediction → payout creation → history refresh.
            </p>
          </div>
        </div>

        {simResult && (
          <div className="mt-4 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-lg shadow-emerald-100/60">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Latest ML Result</p>
                <h2 className="mt-1 text-lg font-bold text-emerald-950">Live payout decision completed</h2>
              </div>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                {simResult.payout ? 'Paid' : 'Held'}
              </span>
            </div>

            <div className="grid gap-4 px-5 py-5 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Amount</p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">
                  INR {Number(simResult.amount || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Risk level</p>
                <p className="mt-2 text-2xl font-bold capitalize text-emerald-950">
                  {simResult.riskLevel || 'low'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Message</p>
                <p className="mt-2 text-sm leading-6 text-emerald-900">{simResult.message}</p>
              </div>
            </div>

            <div className="border-t border-emerald-100 px-5 py-4 text-sm text-emerald-900">
              <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
                {simResult.source === 'demo' ? 'Demo weather fallback used' : 'Live weather used'}
              </span>
              <p className="mt-3 leading-6">
                This payout was calculated after the system fetched weather, ran the ML model, and stored the result in payout history.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default PayoutPage
