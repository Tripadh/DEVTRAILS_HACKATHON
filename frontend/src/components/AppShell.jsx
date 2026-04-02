import { Link, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['worker', 'ops', 'insurer'] },
  { to: '/register', label: 'Register', roles: ['ops'] },
  { to: '/plans', label: 'Plans', roles: ['worker', 'ops'] },
  { to: '/monitor', label: 'Alerts', roles: ['ops', 'insurer'] },
  { to: '/payouts', label: 'Payouts', roles: ['worker', 'insurer'] },
  { to: '/ai', label: 'AI Risk', roles: ['ops', 'insurer'] },
]

function AppShell({ user, onLogout, children }) {
  const visibleNav = navItems.filter((item) => item.roles.includes(user?.role))
  const companyLabel = user?.role === 'worker' && user?.company ? user.company : null

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-xl font-bold tracking-tight text-slate-900">
              GigShield
            </Link>
            {companyLabel && (
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                {companyLabel}
              </span>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-right text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p>{user?.roleLabel}</p>
            {user?.role === 'worker' && user?.workerCompanyId && (
              <p className="text-xs text-slate-500">ID: {user.workerCompanyId}</p>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-5 sm:grid-cols-[230px_1fr] sm:px-6">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white/92 p-2 shadow-lg shadow-slate-200/60 backdrop-blur">
          <div className="rounded-xl bg-slate-900 px-3 py-3 text-white">
            <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Workspace</p>
            <p className="mt-1 text-sm font-semibold">{companyLabel || 'GigShield Control'}</p>
          </div>

          <nav className="mt-3 grid gap-1">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={onLogout}
            className="mt-4 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </aside>

        <main className="grid gap-4">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
