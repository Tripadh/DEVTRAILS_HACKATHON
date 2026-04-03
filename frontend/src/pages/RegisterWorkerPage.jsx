import { useEffect, useState } from 'react'
import { demoUsers } from '../data/mockData'
import { deleteWorker, fetchWorkers } from '../services/gigshieldApi'

function RegisterWorkerPage() {
  const [signedWorkers, setSignedWorkers] = useState(demoUsers.filter((member) => member.role === 'worker'))
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    let active = true

    async function loadWorkers() {
      try {
        const workers = await fetchWorkers()
        if (active && workers.length > 0) {
          setSignedWorkers(workers)
        }
      } catch {
        if (active) {
          setSignedWorkers(demoUsers.filter((member) => member.role === 'worker'))
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadWorkers()

    return () => {
      active = false
    }
  }, [])

  async function handleDeleteWorker(workerId) {
    const confirmed = window.confirm('Delete this worker from the roster?')
    if (!confirmed) {
      return
    }

    setDeletingId(workerId)

    try {
      await deleteWorker(workerId)
      setSignedWorkers((prev) => prev.filter((member) => String(member.id) !== String(workerId)))
    } catch (error) {
      window.alert(error.message || 'Unable to delete worker right now.')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="page-shell">
      <div className="surface-card overflow-hidden p-0">
        <div className="grid gap-0">
          <aside className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/85 p-6 lg:border-b-0 lg:border-r">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
              Worker Onboarding
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Live Worker List
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Review the workers already in the system. This roster uses live backend data when available.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Signed Worker Summary
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-slate-700">
                <li>1 active worker member available for review</li>
                <li>City, company, and worker ID are visible below</li>
                <li>Use this page as a roster view, not onboarding</li>
              </ul>
            </div>
          </aside>

          <div className="bg-white p-6">
            <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="section-title">Worker Roster</h2>
                <p className="section-subtitle">Signed workers already in the project.</p>
              </div>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                Read Only
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Live Worker List
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Worker name, location, and ID shown live for quick review.
                  </p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  {loading ? 'Loading...' : `${signedWorkers.length} workers`}
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {signedWorkers.map((member) => (
                  <article key={member.id} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-800">
                          Live
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteWorker(member.id)}
                          disabled={deletingId === member.id}
                          className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === member.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Location</span>
                        <span className="font-semibold text-slate-900">{member.location || 'Not set'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">ID</span>
                        <span className="font-semibold text-slate-900">
                          {String(member.id || member.workerCompanyId || 'Not set').slice(0, 8)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RegisterWorkerPage
