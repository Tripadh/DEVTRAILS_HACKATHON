function PlanCard({ plan, onActivate }) {
  const isRecommended = plan.id === 'standard'

  return (
    <article
      className={`surface-card p-5 ${
        isRecommended ? 'ring-2 ring-sky-300/80' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
        {isRecommended && (
          <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
            Popular
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{plan.price}</p>
      <p className="text-sm text-slate-500">Premium range: {plan.range}</p>
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        {plan.triggerCoverage}
      </p>
      <button
        className="mt-5 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-slate-600"
        onClick={() => onActivate(plan)}
      >
        Activate Coverage
      </button>
    </article>
  )
}

export default PlanCard
