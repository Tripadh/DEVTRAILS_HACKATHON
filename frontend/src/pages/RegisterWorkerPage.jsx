import { useState } from 'react'
import { registerWorker } from '../services/gigshieldApi'

const initialForm = {
  name: '',
  occupation: '',
  city: '',
  dailyIncome: '',
  shift: '',
  upi: '',
}

function RegisterWorkerPage() {
  const [form, setForm] = useState(initialForm)
  const [success, setSuccess] = useState('')

  const fieldLabels = {
    name: 'Worker Name',
    occupation: 'Occupation',
    city: 'City / Zone',
    dailyIncome: 'Daily Income',
    shift: 'Shift',
    upi: 'UPI ID',
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const result = await registerWorker(form)
    setSuccess(result.message)
    setForm(initialForm)
  }

  return (
    <section className="surface-card p-5">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.25fr]">
        <div className="rounded-2xl bg-slate-900 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.15em] text-cyan-200">Onboarding</p>
          <h1 className="mt-2 text-2xl font-bold">Register Worker</h1>
          <p className="mt-2 text-sm text-slate-200">
            Add worker identity, work zone, and payout details in one quick form.
          </p>

          <div className="mt-5 rounded-xl bg-white/10 p-3 text-sm text-slate-100">
            <p>Fields aligned with future backend DTO structure.</p>
          </div>
        </div>

        <div>
          <p className="section-subtitle">Quick onboarding form for demo.</p>

          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit}>
            {Object.keys(initialForm).map((field) => (
              <label key={field} className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">
                  {fieldLabels[field]}
                </span>
                <input
                  value={form[field]}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-slate-900"
                  required
                />
              </label>
            ))}

            <button
              className="sm:col-span-2 mt-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-slate-600"
              type="submit"
            >
              Register Worker
            </button>
          </form>

          {success && (
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {success}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default RegisterWorkerPage
