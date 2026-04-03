import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AlertCard from '../components/AlertCard'
import StatusPill from '../components/StatusPill'
import apiClient from '../services/apiClient'
import { fetchDashboard } from '../services/gigshieldApi'
import './WorkerDashboardPage.css'

function WorkerDashboardPage({ user }) {
  const [data, setData] = useState(null)
  const [liveLocation, setLiveLocation] = useState(null)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [realWeather, setRealWeather] = useState(null)
  const [demoScenario, setDemoScenario] = useState(null)

  useEffect(() => {
    fetchDashboard(user.role, user).then(setData)
  }, [user])

  // Fetch real weather from OpenWeather API based on live location
  useEffect(() => {
    if (!liveLocation) return

    const fetchRealWeather = async () => {
      try {
        const response = await apiClient.post('/weather/check', {
          location: `${liveLocation.lat},${liveLocation.lng}`,
        })

        const weatherData = response.data?.data

        // Extract relevant weather info
        const temperature = Math.round(weatherData?.temperature || 0)
        const rainfall = weatherData?.rainfall || 0
        const humidity = weatherData?.humidity || 0
        const description = weatherData?.eventType || 'NORMAL'

        // Determine event type based on weather
        let eventType = 'NORMAL'
        if (rainfall > 2.5) {
          eventType = 'RAIN'
        } else if (temperature > 35) {
          eventType = 'HEAT'
        }

        setRealWeather({
          temperature,
          rainfall,
          humidity,
          description,
          eventType,
        })
      } catch (error) {
        console.log('Weather fetch error:', error.message)
      }
    }

    fetchRealWeather()
  }, [liveLocation])

  function buildRiskProfile(weather = {}) {
    const rainfall = Number(weather.rainfall || 0)
    const temperature = Number(weather.temperature || 0)

    if (rainfall > 60) {
      return {
        level: 'High',
        reason: 'Heavy rain above 60mm detected in your zone.',
      }
    }

    if (temperature > 40) {
      return {
        level: 'Medium',
        reason: 'Temperature is above 40°C, so heat risk is elevated.',
      }
    }

    return {
      level: 'Low',
      reason: 'Weather is currently stable and below trigger thresholds.',
    }
  }

  function handleSimulateHeavyRain() {
    setDemoScenario({
      weather: {
        temperature: 33,
        rainfall: 75,
        humidity: 92,
        eventType: 'RAIN',
      },
      riskProfile: {
        level: 'High',
        reason: 'Simulated heavy rain above 60mm for demo clarity.',
      },
      premium: {
        weeklyAmount: '₹60',
        coverageSource: 'Covered by Partner',
      },
      latestPayout: {
        event: 'Heavy Rain Disruption',
        amount: 'INR 400',
        status: 'Paid',
      },
      triggerMessage: 'Heavy rain detected → payout triggered',
      decisionAction: 'PAYOUT',
      aiDecisionReason: 'Heavy rain detected',
    })
  }

  // Get live location on component mount
  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLiveLocation({ lat: latitude, lng: longitude })
        setLocationAccuracy(Math.round(accuracy))
      },
      () => {
        // Silently fail
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )

    // Watch for location updates every 30 seconds
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLiveLocation({ lat: latitude, lng: longitude })
        setLocationAccuracy(Math.round(accuracy))
      },
      () => {
        // Silently fail, don't show error
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  if (!data) {
    return <p className="surface-card p-6 text-slate-600">Loading worker dashboard...</p>
  }

  const weatherSnapshot = demoScenario?.weather || realWeather || data.weather || {}
  const triggerCount = data.liveAlerts.filter((a) => a.status === 'Triggered').length
  const policy = data.policy || {
    title: 'Your Insurance Policy',
    status: 'Active',
    coverageAmount: '₹800 per event',
    triggers: ['Rain', 'Heat', 'Flood'],
  }
  const riskProfile = demoScenario?.riskProfile || data.riskProfile || buildRiskProfile(weatherSnapshot)
  const premium = demoScenario?.premium || data.premium || {
    weeklyAmount: riskProfile.level === 'High' ? '₹60' : riskProfile.level === 'Medium' ? '₹45' : '₹30',
    coverageSource: 'Covered by Partner',
  }
  const latestPayout = demoScenario?.latestPayout || data.latestPayout || {
    event: 'No payout yet',
    amount: 'INR 0',
    status: 'Pending',
  }
  const triggerMessage = demoScenario?.triggerMessage || data.triggerMessage || 'No active trigger right now'
  const aiDecisionAction = demoScenario?.decisionAction || data.decisionAction || (data.aiDecision === 'Auto Approve' ? 'PAYOUT' : 'HOLD')
  const aiDecisionReason = demoScenario?.aiDecisionReason || data.aiDecisionReason || (aiDecisionAction === 'PAYOUT' ? 'Heavy rain detected' : 'No trigger conditions met')
  const visibleTriggers = data.liveAlerts.slice(0, 5)

  return (
    <div className="worker-dashboard page-shell">
      <section className="worker-dashboard__hero surface-card">
        <div className="page-header">
          <p className="page-header__eyebrow">
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 0 1 2.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0 1 10 1.944Z" clipRule="evenodd" />
            </svg>
            Worker Dashboard
          </p>
          <h1 className="page-header__title">Welcome back, {data.worker.name}</h1>
          <p className="page-header__subtitle">
            Track zone activity, live trigger alerts, and payout readiness for your shifts.
          </p>
          <div className="page-header__tags">
            <span className="tag tag--brand">Role: {user.roleLabel}</span>
            <span className="tag">Zone: {data.worker.zone || 'Not Set'}</span>
            {user.company && (
              <span className="tag tag--success">
                {user.company}
                {user.workerCompanyId ? ` · ${user.workerCompanyId}` : ''}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="stats-row">
          <div className="stat-card">
            <p className="stat-card__label">Coverage</p>
            <p className="stat-card__value stat-card--success">{data.coverageStatus}</p>
            <p className="stat-card__hint">Policy state</p>
          </div>
          <div className="stat-card weather-card">
            <div className="weather-card__icon">
              {(realWeather?.eventType || data.weather?.eventType) === 'RAIN' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="2" x2="12" y2="9"/>
                  <polyline points="4 14 10 9 16 14"/>
                  <path d="M6 17c0 .5-.4 1-1 1a1 1 0 0 1-1-1"/>
                  <path d="M12 17c0 .5-.4 1-1 1a1 1 0 0 1-1-1"/>
                  <path d="M18 17c0 .5-.4 1-1 1a1 1 0 0 1-1-1"/>
                </svg>
              )}
              {(realWeather?.eventType || data.weather?.eventType) === 'HEAT' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
              {(realWeather?.eventType || data.weather?.eventType) !== 'RAIN' && 
               (realWeather?.eventType || data.weather?.eventType) !== 'HEAT' && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="13" r="8"/>
                  <path d="M12 5V1M12 25v-4M5 13H1m20 0h-4M7.46 8.46l-2.83-2.83M19.37 19.37l-2.83-2.83M7.46 17.54l-2.83 2.83M19.37 4.63l-2.83 2.83"/>
                </svg>
              )}
            </div>
            <p className="stat-card__label">Weather</p>
            <div className="weather-card__temps">
              <span className="weather-card__temp">{realWeather?.temperature ?? Math.round(data.weather?.temperature || 0)}°C</span>
                <span className="weather-card__rainfall">Rain: {((realWeather?.rainfall) ?? (data.weather?.rainfall || 0)).toFixed(1)} mm</span>
            </div>
            <div className="weather-badge" style={{
              backgroundColor: (realWeather?.eventType || data.weather?.eventType) === 'RAIN' ? '#3b82f6' : (realWeather?.eventType || data.weather?.eventType) === 'HEAT' ? '#ff6b35' : '#10b981',
              color: '#fff',
            }}>
              {realWeather?.eventType || data.weather?.eventType || 'NORMAL'}
            </div>
            {realWeather && <p className="weather-card__description" style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>{realWeather.description}</p>}
          </div>
          <div className="stat-card location-card">
            <div className="location-card__icon">
              {liveLocation ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="1" />
                  <path d="M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14" />
                  <path d="M12 1v6M12 17v6M5 12H1m18 0h-4M6.22 6.22l-4.24 4.24M19.78 19.78l-4.24-4.24M19.78 4.22l-4.24 4.24M6.22 19.78l-4.24-4.24" />
                </svg>
              )}
            </div>
            <p className="stat-card__label">Live Location</p>
            {liveLocation ? (
              <>
                <div className="location-card__coords">
                  <span className="location-card__coord">{liveLocation.lat.toFixed(4)}</span>
                  <span className="location-card__separator">·</span>
                  <span className="location-card__coord">{liveLocation.lng.toFixed(4)}</span>
                </div>
                <div className="location-card__accuracy">
                  Accuracy: ±{locationAccuracy}m
                </div>
                <Link to="/tracking" className="location-card__link">
                  View Full Tracking →
                </Link>
              </>
            ) : (
              <div className="location-card__loading">
                <p className="location-card__status">Getting location...</p>
                <p className="location-card__status-hint">Allow location access to track</p>
              </div>
            )}
          </div>
          <div className="stat-card">
            <p className="stat-card__label">Total Auto Payouts</p>
            <p className="stat-card__value stat-card--brand">{data.totalPayouts}</p>
            <p className="stat-card__hint">Settled so far</p>
          </div>
      </section>

      <section className="insurance-grid">
        <div className="panel surface-card insurance-panel">
          <div className="panel__header">
            <div>
              <p className="panel__title">{policy.title}</p>
              <p className="panel__subtitle">Clear policy overview for the demo.</p>
            </div>
            <span className="panel__badge">{policy.status}</span>
          </div>

          <div className="insurance-policy__content">
            <div className="insurance-policy__coverage">
              <span className="insurance-policy__label">Coverage amount</span>
              <span className="insurance-policy__value">{policy.coverageAmount}</span>
            </div>

            <div>
              <p className="insurance-policy__label">Triggers</p>
              <div className="insurance-policy__triggers">
                {policy.triggers.map((trigger) => (
                  <span key={trigger} className="tag tag--brand">
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel surface-card insurance-panel">
          <div className="panel__header">
            <div>
              <p className="panel__title">Risk & Premium</p>
              <p className="panel__subtitle">Derived from current weather and location conditions.</p>
            </div>
            <span className={`panel__badge panel__badge--risk panel__badge--${riskProfile.level.toLowerCase()}`}>
              {riskProfile.level}
            </span>
          </div>

          <div className="insurance-risk__reason">{riskProfile.reason}</div>

          <div className="insurance-demo-actions">
            <button type="button" className="location-card__link" onClick={handleSimulateHeavyRain}>
              Simulate Heavy Rain
            </button>
            {demoScenario && (
              <button
                type="button"
                className="insurance-demo-actions__reset"
                onClick={() => setDemoScenario(null)}
              >
                Use Live Data
              </button>
            )}
          </div>

          <div className="insurance-grid__mini">
            <div className="mini-card">
              <p className="mini-card__label">Weekly premium</p>
              <p className="mini-card__value">{premium.weeklyAmount}</p>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Funding</p>
              <p className="mini-card__value">{premium.coverageSource}</p>
            </div>
          </div>

          <div className="insurance-payout-box">
            <p className="insurance-policy__label">Latest payout</p>
            <p className="insurance-payout-box__event">{latestPayout.event}</p>
            <p className="insurance-payout-box__amount">{latestPayout.amount}</p>
            <p className="insurance-payout-box__status">{latestPayout.status}</p>
          </div>

          <div className="insurance-trigger-message">{triggerMessage}</div>
        </div>
      </section>

      <section className="panel surface-card">
        <div className="panel__header">
          <div>
            <p className="panel__title">Automated Trigger Feed</p>
            <p className="panel__subtitle">The 5 trigger types are visible here in the worker frontend.</p>
          </div>
          <span className="panel__badge">{visibleTriggers.length} shown</span>
        </div>

        <div className="alerts-grid">
          {visibleTriggers.map((alert) => (
            <AlertCard key={`worker-${alert.id}`} alert={alert} />
          ))}
        </div>
      </section>

      <section className="hero-card surface-card">
          <div className="hero-card__main">
            <div className="hero-card__mini-stats">
              <div className="mini-stat">
                <p className="mini-stat__label">Live Alerts</p>
                <p className="mini-stat__value">{data.liveAlerts.length}</p>
              </div>
              <div className="mini-stat">
                <p className="mini-stat__label">Triggered</p>
                <p className="mini-stat__value">{triggerCount}</p>
              </div>
              <div className="mini-stat">
                <p className="mini-stat__label">Auto Payout</p>
                <p className="mini-stat__value">{data.totalPayouts}</p>
              </div>
            </div>
          </div>

          <div className="hero-card__aside">
            <div className="coverage-panel">
              <div className="coverage-panel__header">
                <p className="coverage-panel__label">Coverage Health</p>
                <div className="coverage-orb" />
              </div>
              <div className="coverage-status-row">
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 5 }}>Current status</p>
                  <StatusPill status={data.coverageStatus} />
                </div>
              </div>
              <div className="coverage-info-box">
                Worker protection is active for your current zone.
              </div>
            </div>

            <div className="sync-pill">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ color: 'var(--success)' }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Last sync: just now
            </div>
          </div>
      </section>

      <div className="content-grid">

          <section className="panel surface-card">
            <div className="panel__header">
              <div>
                <p className="panel__title">Live Risk Alerts</p>
                <p className="panel__subtitle">Event signals from monitored cities and zones.</p>
              </div>
              <span className="panel__badge">{data.liveAlerts.length} active</span>
            </div>

            {data.liveAlerts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state__title">No active alerts right now</p>
                <p className="empty-state__desc">
                  The system is monitoring weather events continuously. New alerts will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="alerts-grid">
                {data.liveAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            )}
          </section>

          <section className="panel surface-card">
            <div className="panel__header">
              <div>
                <p className="panel__title">AI Decision Status</p>
                <p className="panel__subtitle">Current decision pipeline for active triggers.</p>
              </div>
            </div>

            <div className="ai-panel__decision">
              <p className="ai-panel__decision-label">Current Decision</p>
              <p className="ai-panel__decision-value">{aiDecisionAction}</p>
            </div>

            <div className="ai-panel__note">
              Reason: {aiDecisionReason}
            </div>

            <div className="ai-panel__status">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              Decision engine online
            </div>

            <div className="ai-panel__note">
              Next review cycle in 15 minutes. Keep your zone and alerts monitored for trigger updates.
            </div>
          </section>

      </div>
    </div>
  )
}

export default WorkerDashboardPage