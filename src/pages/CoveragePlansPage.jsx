import { useEffect, useState } from 'react'
import PlanCard from '../components/PlanCard'
import { fetchPlans } from '../services/gigshieldApi'

function CoveragePlansPage() {
  const [planRows, setPlanRows] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPlans().then(setPlanRows)
  }, [])

  function handleActivate(plan) {
    setMessage(`${plan.name} Coverage Activated`)
  }

  return (
    <section className="surface-card p-0">
      <div className="rounded-t-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 px-5 py-6 text-white">
        <h1 className="text-2xl font-bold">Coverage Plans</h1>
        <p className="mt-1 text-sm text-slate-200">Choose Basic, Standard, or Pro.</p>
      </div>

      <div className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          {planRows.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onActivate={handleActivate} />
          ))}
        </div>

        {message && (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {message}
          </p>
        )}
      </div>
    </section>
  )
}

export default CoveragePlansPage
