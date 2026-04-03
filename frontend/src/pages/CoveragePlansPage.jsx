import { useEffect, useState } from 'react'
import PlanCard from '../components/PlanCard'
import { demoWorker } from '../data/mockData'
import { activateCoverage, fetchPlans } from '../services/gigshieldApi'

function CoveragePlansPage({ user }) {
  const [planRows, setPlanRows] = useState([])
  const [message, setMessage] = useState('')
  const [activationResult, setActivationResult] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [upiId, setUpiId] = useState(user?.upi || demoWorker.upi)
  const [weeklyReminder, setWeeklyReminder] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    fetchPlans().then(setPlanRows)
  }, [])

  useEffect(() => {
    setUpiId(user?.upi || demoWorker.upi)
  }, [user?.upi])

  const workerName = user?.name || demoWorker.name
  const workerCompany = user?.company || 'GigShield Partner'
  const workerId = user?.workerCompanyId || 'ZOM-7782'
  const selectedPlan = planRows.find((plan) => plan.id === selectedPlanId) || planRows[1] || planRows[0]

  const staticTriggers = [
    {
      id: 'rain',
      title: 'Heavy Rain',
      threshold: '65mm/hr for 30+ min',
      payout: 'INR 300-500',
      source: 'IMD + OpenWeatherMap',
      tone: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    {
      id: 'heat',
      title: 'Extreme Heat',
      threshold: 'Feels like 42°C+ for 2 hrs',
      payout: 'INR 300-500',
      source: 'IMD + Heat Index',
      tone: 'bg-amber-50 border-amber-200 text-amber-800',
    },
    {
      id: 'curfew',
      title: 'Curfew / Shutdown',
      threshold: 'Official order in worker zone',
      payout: 'INR 400-600',
      source: 'State portal + NDMA',
      tone: 'bg-rose-50 border-rose-200 text-rose-800',
    },
    {
      id: 'flood',
      title: 'Urban Flooding',
      threshold: 'Ward alert or flood notice',
      payout: 'INR 500-700',
      source: 'Municipal API + IMD',
      tone: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    },
    {
      id: 'cyclone',
      title: 'Cyclone Warning',
      threshold: 'IMD Category 1+ within 200km',
      payout: 'INR 600-900',
      source: 'IMD + RSMC',
      tone: 'bg-violet-50 border-violet-200 text-violet-800',
    },
  ]

  const planDetails = {
    basic: {
      badge: 'Entry level coverage',
      bestFor: 'Workers who want the lowest weekly premium',
      benefits: ['3 trigger types', 'Core weather protection', 'Fast activation flow'],
      coverAmount: 'Up to INR 400 per trigger',
      waitingPeriod: 'Active immediately after activation',
    },
    standard: {
      badge: 'Recommended balance',
      bestFor: 'Most delivery workers and daily riders',
      benefits: ['All 5 trigger types', 'Balanced premium', 'Highest value per week'],
      coverAmount: 'Up to INR 600 per trigger',
      waitingPeriod: 'Active immediately after activation',
    },
    pro: {
      badge: 'Priority support',
      bestFor: 'High-volume riders who need premium coverage',
      benefits: ['All triggers + priority handling', 'Faster payout review', 'Priority support lane'],
      coverAmount: 'Up to INR 900 per trigger',
      waitingPeriod: 'Active immediately after activation',
    },
  }

  const activePlanDetails = selectedPlan ? planDetails[selectedPlan.id] : null

  async function handleActivate(plan) {
    setSelectedPlanId(plan.id)
    setActivationResult(null)
    setMessage('Processing coverage activation through the ML payout flow...')
    setActivating(true)

    try {
      const result = await activateCoverage({
        planName: plan.name,
        upiId,
        location: user?.location,
      })

      setActivationResult({
        planName: plan.name,
        upiId,
        amount: result.amount,
        riskLevel: result.riskLevel,
        payout: result.payout,
      })
      setMessage(
        `${plan.name} activated for ${workerName}. ${result.message} UPI: ${upiId || 'not set yet'}.`,
      )
    } catch (error) {
      setActivationResult(null)
      setMessage(error.message || 'Unable to activate coverage right now.')
    } finally {
      setActivating(false)
    }
  }

  function handleSelect(plan) {
    setSelectedPlanId(plan.id)
    setMessage(`${plan.name} selected. Review the UPI box below before activation.`)
  }

  return (
    <section className="page-shell">
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-900 px-6 py-7 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Coverage Plans
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">Pick your plan, confirm your UPI, and activate</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-200">
                This page shows the worker identity, selected plan, UPI payout destination, coverage highlights, and activation summary in one place.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-100">Current Worker</p>
              <p className="mt-1 text-lg font-semibold text-white">{workerName}</p>
              <p className="text-slate-200">{workerCompany}</p>
              <p className="text-xs text-slate-300">ID: {workerId}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 xl:grid-cols-[0.95fr_1.45fr] xl:p-7">
          <aside className="grid gap-5 self-start">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Profile Snapshot</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-700">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="text-slate-500">Worker name</span>
                  <span className="font-semibold text-slate-900">{workerName}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="text-slate-500">Company</span>
                  <span className="font-semibold text-slate-900">{workerCompany}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="text-slate-500">Worker ID</span>
                  <span className="font-semibold text-slate-900">{workerId}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2">
                  <span className="text-slate-500">Role</span>
                  <span className="font-semibold text-slate-900">{user?.roleLabel || 'Worker'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800">UPI Payout Box</p>
              <p className="mt-3 text-sm leading-6 text-cyan-900/80">
                Enter the UPI ID where payouts should be sent. This is the destination used when coverage is activated.
              </p>
              <label className="mt-4 grid gap-2">
                <span className="text-sm font-semibold text-cyan-900">UPI ID</span>
                <input
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="name@bank"
                  className="h-12 rounded-xl border border-cyan-300 bg-white px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={weeklyReminder}
                  onChange={(event) => setWeeklyReminder(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Send weekly premium reminder
              </label>
              <p className="mt-3 text-xs text-cyan-900/70">
                Payouts and premium updates will show this UPI ID once coverage is live.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Static Trigger Showcase</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                These are the core event triggers shown immediately in the flow.
              </p>
              <div className="mt-5 grid gap-3">
                {staticTriggers.map((trigger) => (
                  <div key={trigger.id} className={`rounded-2xl border px-4 py-4 ${trigger.tone}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] opacity-80">{trigger.title}</p>
                        <p className="mt-1 text-sm leading-6 opacity-90">{trigger.threshold}</p>
                      </div>
                      <span className="rounded-full border border-current/20 bg-white/50 px-2.5 py-1 text-xs font-semibold">
                        Live
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm">
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
                        <span className="text-slate-600">Payout</span>
                        <span className="font-semibold text-slate-900">{trigger.payout}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2">
                        <span className="text-slate-600">Source</span>
                        <span className="font-semibold text-slate-900">{trigger.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected Plan Summary</p>
              {selectedPlan ? (
                <div className="mt-5 space-y-4 text-sm text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-lg font-bold text-slate-900">{selectedPlan.name}</p>
                    <p className="text-sm text-slate-500">{activePlanDetails?.badge}</p>
                  </div>
                  <div className="grid gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Weekly premium</span>
                      <span className="font-semibold text-slate-900">{selectedPlan.price}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Coverage range</span>
                      <span className="font-semibold text-slate-900">{selectedPlan.range}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Payout ceiling</span>
                      <span className="font-semibold text-slate-900">{activePlanDetails?.coverAmount}</span>
                    </div>
                  </div>
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
                    {weeklyReminder ? 'Weekly reminder is on.' : 'Weekly reminder is off.'}
                  </p>
                  {activationResult && (
                    <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-lg shadow-emerald-100/60">
                      <div className="flex items-center justify-between gap-3 border-b border-emerald-100 px-5 py-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                            Activation Result
                          </p>
                          <h3 className="mt-1 text-lg font-bold text-emerald-950">
                            Coverage active and payout flow completed
                          </h3>
                        </div>
                        <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                          Live
                        </span>
                      </div>

                      <div className="grid gap-4 px-5 py-5">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Plan</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-950">{activationResult.planName}</p>
                          </div>
                          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Risk level</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-950 capitalize">
                              {activationResult.riskLevel || 'low'}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Payout</p>
                            <p className="mt-2 text-3xl font-bold tracking-tight">
                              INR {Number(activationResult.amount || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">UPI</p>
                            <p className="mt-2 break-all text-base font-semibold text-emerald-950">
                              {activationResult.upiId}
                            </p>
                          </div>
                        </div>

                        <p className="rounded-2xl border border-emerald-200 bg-emerald-100/70 px-4 py-3 text-sm font-medium text-emerald-900">
                          {activationResult.payout
                            ? 'Coverage activated through the ML payout flow.'
                            : 'Coverage completed without payout.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Select a plan to see the activation summary.</p>
              )}
            </div>
          </aside>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plan Comparison</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">Compare features and highlight the active choice</h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {selectedPlan ? `Selected: ${selectedPlan.name}` : 'No plan selected yet'}
                </span>
              </div>

              <div className="mt-6 grid gap-5 2xl:grid-cols-3 xl:grid-cols-2">
                {planRows.map((plan) => {
                  const details = planDetails[plan.id]
                  return (
                    <PlanCard
                      key={plan.id}
                      plan={{ ...plan, tagline: details.badge, highlights: details.benefits }}
                      selected={selectedPlanId === plan.id || (!selectedPlanId && plan.id === 'standard')}
                      onSelect={handleSelect}
                      onActivate={handleActivate}
                    />
                  )
                })}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What happens after activation</p>
                <div className="mt-5 grid gap-4 text-sm text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">1. Selected plan is locked in</p>
                    <p className="mt-1 text-slate-600">The chosen plan is highlighted so the worker can clearly verify the plan before paying.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">2. UPI ID is used for payouts</p>
                    <p className="mt-1 text-slate-600">The UPI field becomes the payout destination for future approved claims and premium-related flows.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">3. Coverage details stay visible</p>
                    <p className="mt-1 text-slate-600">Worker name, company, worker ID, premium, trigger coverage, and payout ceiling all remain on screen for confirmation.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Activation Preview</p>
                <div className="mt-5 grid gap-4 text-sm text-slate-200">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Worker</p>
                    <p className="mt-1 font-semibold text-white">{workerName}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">UPI ID</p>
                    <p className="mt-1 font-semibold text-white">{upiId || 'Add UPI ID to continue'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Plan selected</p>
                    <p className="mt-1 font-semibold text-white">{selectedPlan?.name || 'Standard'}</p>
                    <p className="mt-1 text-xs text-slate-300">{selectedPlan?.triggerCoverage || 'All triggers'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Coverage status</p>
                    <p className="mt-1 font-semibold text-white">Ready to activate</p>
                    <p className="mt-1 text-xs text-slate-300">{activePlanDetails?.waitingPeriod}</p>
                  </div>
                </div>
                <button
                  className="mt-5 w-full rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  type="button"
                  onClick={() => selectedPlan && handleActivate(selectedPlan)}
                  disabled={!selectedPlan || !upiId || activating}
                >
                  {activating ? 'Activating...' : `Activate ${selectedPlan ? selectedPlan.name : 'Coverage'}`}
                </button>
              </div>
            </div>

            {message && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CoveragePlansPage
