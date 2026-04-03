function PlanCard({ plan, selected = false, onSelect, onActivate }) {
  const isRecommended = plan.id === 'standard'
  const accentClass = selected
    ? 'border-cyan-400 bg-cyan-50/70 shadow-lg shadow-cyan-100/70 ring-2 ring-cyan-300/80'
    : isRecommended
      ? 'ring-2 ring-sky-300/80'
      : ''

  return (
    <article className={`surface-card h-full p-6 transition md:p-7 ${accentClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{plan.name}</h3>
          <p className="text-sm font-medium text-cyan-700">
            {plan.tagline}
          </p>
        </div>
        {isRecommended && (
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
            Popular
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{plan.price}</p>
      <p className="mt-1 text-sm text-slate-500">Premium range: {plan.range}</p>
      <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-700">
        {plan.highlights.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2">
            <span className="mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {plan.triggerCoverage}
      </p>
      {selected && (
        <p className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          Selected plan ready for UPI activation
        </p>
      )}
      <div className="mt-5 grid gap-3">
        <button
          className={`h-11 w-full rounded-xl px-4 text-sm font-semibold transition ${
            selected
              ? 'bg-cyan-600 text-white hover:bg-cyan-500'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
          onClick={() => onSelect(plan)}
          type="button"
        >
          {selected ? 'Selected' : 'Select Plan'}
        </button>
        <button
          className="h-11 w-full rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 text-sm font-semibold text-white transition hover:from-slate-800 hover:to-slate-600"
          onClick={() => onActivate(plan)}
          type="button"
        >
          Activate Coverage
        </button>
      </div>
    </article>
  )
}

export default PlanCard
