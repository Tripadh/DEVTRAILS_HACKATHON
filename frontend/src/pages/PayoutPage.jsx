import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import StatusPill from '../components/StatusPill'
import { fetchPayouts, simulateTrigger } from '../services/gigshieldApi'

function PayoutPage() {
  const [rows, setRows] = useState([])
  const [simResult, setSimResult] = useState('')

  useEffect(() => {
    fetchPayouts().then(setRows)
  }, [])

  async function handleSimulate() {
    try {
      const result = await simulateTrigger()
      setSimResult(result.message)
      const updatedRows = await fetchPayouts()
      setRows(updatedRows)
    } catch (error) {
      setSimResult(error.message || 'Unable to simulate payout trigger right now.')
    }
  }

  return (
    <div className="page-shell">
      <section className="surface-card p-5">
        <h1 className="section-title">Payout Center</h1>
        <p className="section-subtitle">Auto-claims, no forms, and fast transfer updates.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard title="Auto Approved" value="INR 400" hint="Latest approved payout" />
        <StatCard title="Processing" value="INR 500" hint="Expected in queue" />
        <StatCard title="Current Message" value="INR 400 credited" />
      </section>

      <section className="surface-card p-5">
        <div className="overflow-hidden rounded-xl border border-slate-200">
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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleSimulate}
            className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-slate-600"
          >
            Simulate Trigger
          </button>

          <p className="text-sm text-slate-600">
            Latest message: {simResult || 'No trigger simulation yet'}
          </p>
        </div>

        {simResult && (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {simResult}
          </p>
        )}
      </section>
    </div>
  )
}

export default PayoutPage
