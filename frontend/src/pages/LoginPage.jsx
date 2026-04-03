import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { workerCompanyOptions } from '../data/mockData'
import {
  fetchRoleOptions,
  loginUser,
  requestLoginOtp,
  signupUser,
  verifyLoginOtp,
} from '../services/gigshieldApi'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [roles, setRoles] = useState([])
  const [form, setForm] = useState({
    name: '',
    email: 'ravi@gigshield.app',
    password: 'demo1234',
    confirmPassword: '',
    location: '',
    role: 'worker',
    company: 'Zomato',
    workerCompanyId: '',
    phone: '',
    otp: '',
  })
  const [loginOtpStep, setLoginOtpStep] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [submittingPasswordAuth, setSubmittingPasswordAuth] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const roleRoutes = {
    worker: '/dashboard',
    ops: '/monitor',
    insurer: '/payouts',
    operations: '/monitor',
    insurance: '/payouts',
  }

  useEffect(() => {
    fetchRoleOptions().then(setRoles).catch(() => setRoles([]))
  }, [])

  function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '')
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function getLandingRoute(session, fallbackRole) {
    const sessionRole = String(session?.user?.role || session?.user?.platform || fallbackRole || 'worker').toLowerCase()
    return roleRoutes[sessionRole] || '/dashboard'
  }

  function applySelectedRole(session, selectedRole) {
    const normalizedRole = String(selectedRole || session?.user?.role || session?.user?.platform || 'worker').toLowerCase()

    return {
      ...session,
      user: {
        ...session.user,
        role: normalizedRole,
        roleLabel: normalizedRole === 'ops'
          ? 'Operations'
          : normalizedRole === 'insurer'
            ? 'Insurer'
            : 'Worker',
        platform: normalizedRole,
      },
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setOtpSent(false)
    setLoginOtpStep(false)
    setForm((prev) => ({
      ...prev,
      password: '',
      confirmPassword: '',
    }))
  }

  async function handlePasswordAuth(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'login' && !loginOtpStep) {
      const cleanPhone = normalizePhone(form.phone)

      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        setError('Enter a valid phone number with 10 to 15 digits.')
        return
      }

      setSendingOtp(true)

      try {
        const result = await requestLoginOtp(cleanPhone)
        setForm((prev) => ({ ...prev, phone: result.phone, otp: '' }))
        setLoginOtpStep(true)
        setOtpSent(true)
        setSuccess('OTP sent. Check the backend console for the 6-digit code.')
      } catch (apiError) {
        setError(apiError.message || 'Unable to send OTP right now.')
      } finally {
        setSendingOtp(false)
      }

      return
    }

    if (mode === 'login' && loginOtpStep) {
      const cleanPhone = normalizePhone(form.phone)

      if (!/^\d{6}$/.test(String(form.otp).trim())) {
        setError('Enter the 6-digit OTP.')
        return
      }

      setVerifyingOtp(true)

      try {
        await verifyLoginOtp(cleanPhone, String(form.otp).trim())

        const session = await loginUser({
          email: form.email,
          password: form.password,
          role: form.role,
          company: form.company,
          workerCompanyId: form.workerCompanyId,
        })

        const routedSession = applySelectedRole(session, form.role)
        onLogin(routedSession)
        navigate(getLandingRoute(routedSession, form.role))
      } catch (apiError) {
        setError(apiError.message || 'OTP verification failed. Please try again.')
      } finally {
        setVerifyingOtp(false)
      }

      return
    }

    setSubmittingPasswordAuth(true)

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const payload = {
        name: form.name || 'GigShield User',
        email: form.email,
        password: form.password,
        location: form.location.trim() || 'Bengaluru',
        role: form.role,
        company: form.company,
        workerCompanyId: form.workerCompanyId,
      }

      await signupUser(payload)

      setMode('login')
      setLoginOtpStep(false)
      setOtpSent(false)
      setForm((prev) => ({
        ...prev,
        name: '',
        location: '',
        password: '',
        confirmPassword: '',
        phone: '',
        otp: '',
      }))
      setSuccess('Signup successful. Please login to continue.')
    } catch (apiError) {
      setError(apiError.message || 'Authentication failed. Please try again.')
    } finally {
      setSubmittingPasswordAuth(false)
    }
  }

  // Request an OTP and show it in the backend console for local testing.
  async function handleSendOtp(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const cleanPhone = normalizePhone(form.phone)

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError('Enter a valid phone number with 10 to 15 digits.')
      return
    }

    setSendingOtp(true)

    try {
      const result = await requestLoginOtp(cleanPhone)
      setForm((prev) => ({ ...prev, phone: result.phone, otp: '' }))
      setOtpSent(true)
      setSuccess('OTP sent. Check the backend console for the 6-digit code.')
    } catch (apiError) {
      setError(apiError.message || 'Unable to send OTP right now.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Verify the OTP and store the returned JWT session in App state.
  async function handleVerifyOtp(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    const cleanPhone = normalizePhone(form.phone)

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError('Enter the same valid phone number used to request the OTP.')
      return
    }

    if (!/^\d{6}$/.test(String(form.otp).trim())) {
      setError('Enter the 6-digit OTP.')
      return
    }

    setVerifyingOtp(true)

    try {
      const session = await verifyLoginOtp(cleanPhone, String(form.otp).trim())
      const routedSession = applySelectedRole(session, form.role)
      onLogin(routedSession)
      navigate(getLandingRoute(routedSession, form.role))
    } catch (apiError) {
      setError(apiError.message || 'OTP verification failed. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 py-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />

      <section className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] shadow-2xl backdrop-blur-xl md:grid md:grid-cols-[1.1fr_1fr]">
        <aside className="hidden bg-gradient-to-br from-cyan-400/20 via-slate-900/10 to-emerald-300/10 p-8 text-white md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            GigShield
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Login with password, then confirm with OTP.
          </h1>
          <p className="mt-4 text-sm text-slate-200/90">
            Keep signup separate, but make login a two-step flow so the OTP always comes after the password step.
          </p>

          <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-slate-100">
            <p className="font-semibold">Available modes</p>
            <p className="mt-2">• Login with password, then OTP</p>
            <p>• Sign up with role and company details</p>
          </div>
        </aside>

        <div className="bg-white p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            GigShield Access
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {mode === 'login' ? 'Login to continue' : mode === 'signup' ? 'Create your account' : 'Phone OTP Login'}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {mode === 'login'
              ? 'Email/password login for existing users.'
              : mode === 'signup'
                ? 'Register a new account with role and company details.'
                : 'Simple phone-based authentication with OTP.'}
          </p>

          <div className="mt-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => switchMode('login')}
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
              onClick={() => switchMode('signup')}
              className={`rounded-lg px-3 py-2 font-semibold transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {roles.length > 0 ? roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => updateField('role', role.id)}
                className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                  form.role === role.id
                    ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="block">{role.label}</span>
                <span className="mt-1 block text-xs font-normal text-slate-500">
                  Route: {roleRoutes[role.id] || '/dashboard'}
                </span>
              </button>
            )) : (
              <>
                <button
                  type="button"
                  onClick={() => updateField('role', 'worker')}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    form.role === 'worker'
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">Worker</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Route: /dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('role', 'ops')}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    form.role === 'ops'
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">Operations</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Route: /monitor</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('role', 'insurer')}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                    form.role === 'insurer'
                      ? 'border-cyan-300 bg-cyan-50 text-cyan-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block">Insurer</span>
                  <span className="mt-1 block text-xs font-normal text-slate-500">Route: /payouts</span>
                </button>
              </>
            )}
          </div>

          {mode === 'login' ? (
            <>
              <form className="mt-6 grid gap-4" onSubmit={handlePasswordAuth}>
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
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
                    onChange={(event) => updateField('password', event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Enter password"
                    minLength={6}
                    required
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Phone Number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => {
                      updateField('phone', event.target.value)
                      setOtpSent(false)
                      setLoginOtpStep(false)
                      setError('')
                      setSuccess('')
                    }}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={15}
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingOtp ? 'Sending OTP...' : loginOtpStep ? 'Resend OTP' : 'Send OTP'}
                </button>
              </form>

              {loginOtpStep && otpSent && (
                <form className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={handleVerifyOtp}>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Enter OTP to finish login</p>
                    <p className="mt-1 text-xs text-slate-500">
                      The 6-digit code is printed in the backend console for testing.
                    </p>
                  </div>

                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-slate-700">OTP Code</span>
                    <input
                      type="text"
                      value={form.otp}
                      onChange={(event) => updateField('otp', event.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={verifyingOtp}
                    className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {verifyingOtp ? 'Verifying OTP...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sendingOtp ? 'Resending...' : 'Resend OTP'}
                  </button>
                </form>
              )}
            </>
          ) : (
            <form className="mt-6 grid gap-4" onSubmit={handlePasswordAuth}>
              {mode === 'signup' && (
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => updateField('name', event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Enter your name"
                    required
                  />
                </label>
              )}

              {mode === 'signup' && (
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="name@example.com"
                    required
                  />
                </label>
              )}

              {mode === 'signup' && (
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">City / Location</span>
                  <input
                    value={form.location}
                    onChange={(event) => updateField('location', event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Bengaluru"
                    required
                  />
                  <span className="text-xs text-slate-500">Used to set the worker zone on your dashboard.</span>
                </label>
              )}

              {mode === 'signup' && form.role === 'worker' && (
                <>
                  <label className="grid gap-1">
                    <span className="text-sm font-medium text-slate-700">Company</span>
                    <select
                      value={form.company}
                      onChange={(event) => updateField('company', event.target.value)}
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
                      onChange={(event) => updateField('workerCompanyId', event.target.value.toUpperCase())}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                      placeholder="Example: ZOM-7782"
                      required
                    />
                  </label>
                </>
              )}

              {mode === 'signup' && (
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Password</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                    placeholder="Enter password"
                    minLength={6}
                    required
                  />
                </label>
              )}

              {mode === 'signup' && (
                <label className="grid gap-1">
                  <span className="text-sm font-medium text-slate-700">Confirm Password</span>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
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
                  onChange={(event) => updateField('role', event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-900"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={submittingPasswordAuth}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingPasswordAuth
                  ? mode === 'login'
                    ? 'Logging in...'
                    : 'Registering...'
                  : mode === 'login'
                    ? 'Login'
                    : 'Sign Up'}
              </button>
            </form>
          )}

          {error && (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-800">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
              {success}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default LoginPage