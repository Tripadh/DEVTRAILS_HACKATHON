import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import AppShell from './components/AppShell'
import AIRiskEnginePage from './pages/AIRiskEnginePage'
import CoveragePlansPage from './pages/CoveragePlansPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import PayoutPage from './pages/PayoutPage'
import RegisterWorkerPage from './pages/RegisterWorkerPage'
import TriggerMonitorPage from './pages/TriggerMonitorPage'
import { SESSION_STORAGE_KEY } from './services/apiClient'

function RequireRole({ user, allow, children }) {
  if (!allow.includes(user.role)) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm">
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="mt-1 text-sm">
          Your role does not have permission to view this page.
        </p>
      </section>
    )
  }

  return children
}

function ProtectedLayout({ user, onLogout }) {
  return (
    <AppShell user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage user={user} />} />
        <Route
          path="/register"
          element={
            <RequireRole user={user} allow={['ops']}>
              <RegisterWorkerPage />
            </RequireRole>
          }
        />
        <Route
          path="/plans"
          element={
            <RequireRole user={user} allow={['worker', 'ops']}>
              <CoveragePlansPage />
            </RequireRole>
          }
        />
        <Route
          path="/monitor"
          element={
            <RequireRole user={user} allow={['ops', 'insurer']}>
              <TriggerMonitorPage />
            </RequireRole>
          }
        />
        <Route
          path="/payouts"
          element={
            <RequireRole user={user} allow={['worker', 'insurer']}>
              <PayoutPage />
            </RequireRole>
          }
        />
        <Route
          path="/ai"
          element={
            <RequireRole user={user} allow={['ops', 'insurer']}>
              <AIRiskEnginePage />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  const [session, setSession] = useState(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const user = useMemo(() => session?.user || null, [session])

  useEffect(() => {
    if (session) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      return
    }

    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  }, [session])

  function handleLogout() {
    setSession(null)
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLogin={setSession} />
          )
        }
      />
      <Route
        path="/*"
        element={
          user ? (
            <ProtectedLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  )
}

export default App
