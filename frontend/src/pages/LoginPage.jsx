import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerCompanyOptions } from '../data/mockData'
import { fetchRoleOptions, loginUser, signupUser } from '../services/gigshieldApi'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: 'ravi@gigshield.app',
    password: 'demo1234',
    confirmPassword: '',
    role: 'worker',
    company: 'Zomato',
    workerCompanyId: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRoleOptions().then(setRoles).catch(() => setRoles([]))
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup' && form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const payload = {
        name: form.name || 'GigShield User',
        email: form.email,
        password: form.password,
        role: form.role,
        company: form.company,
        workerCompanyId: form.workerCompanyId,
      }

      const response =
        mode === 'login' ? await loginUser(payload) : await signupUser(payload)

      onLogin(response)
      navigate('/dashboard')
    } catch (apiError) {
      setError(apiError.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <section className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-2xl backdrop-blur-xl md:grid md:grid-cols-[1.2fr_1fr]">
        <aside className="hidden bg-gradient-to-br from-cyan-400/20 via-slate-900/10 to-emerald-300/10 p-8 text-white md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            GigShield
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Weather protection for every gig worker.
          </h1>
          <p className="mt-4 text-sm text-slate-200/90">
            Signup with role, login securely, and move into a role-controlled dashboard.
          </p>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100">
            <p className="font-semibold">Demo accounts</p>
            <p className="mt-2">Worker: ravi@gigshield.app / demo1234</p>
            <p>Ops: ops@gigshield.app / demo1234</p>
            <p>Insurer: insurer@gigshield.app / demo1234</p>
          </div>
        </aside>

        <div className="bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            GigShield Access
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {mode === 'login' ? 'Login to continue' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {mode === 'login'
              ? 'Role-based login enabled for Worker, Operations, and Insurer.'
              : 'Signup now and land directly on your role dashboard.'}
          </p>

          <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError('')
                setForm((prev) => ({
                  ...prev,
                  email: prev.email || 'ravi@gigshield.app',
                  password: prev.password || 'demo1234',
                }))
              }}
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError('')
                setForm((prev) => ({
                  ...prev,
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  company: 'Zomato',
                  workerCompanyId: '',
                }))
              }}
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                placeholder="Enter your name"
                required
              />
            </label>
          )}

          {mode === 'signup' && form.role === 'worker' && (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Company</span>
                <select
                  value={form.company}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, company: event.target.value }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                  required
                >
                  {workerCompanyOptions.map((company) => (
                    <option key={company} value={company}>
                      {company}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium text-slate-700">Company Worker ID</span>
                <input
                  value={form.workerCompanyId}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      workerCompanyId: event.target.value.toUpperCase(),
                    }))
                  }
                  className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                  placeholder="Example: ZOM-7782"
                  required
                />
              </label>
            </>
          )}

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              placeholder="name@example.com"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
              placeholder="Enter password"
              minLength={6}
              required
            />
          </label>

          {mode === 'signup' && (
            <label className="grid gap-1">
              <span className="text-sm font-medium text-slate-700">
                Confirm Password
              </span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                placeholder="Re-enter password"
                minLength={6}
                required
              />
            </label>
          )}

          <label className="grid gap-1">
            <span className="text-sm font-medium text-slate-700">Role</span>
            <select
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value }))
              }
              className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : 'Create Account'}
          </button>
        </form>

          <p className="mt-4 text-xs text-slate-500">
            Role selection is validated during login for secure role-based access.
          </p>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
