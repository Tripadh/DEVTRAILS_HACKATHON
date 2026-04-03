import { useState } from 'react'
import LiveLocationMap from '../components/LiveLocationMap'
import './LiveTrackingPage.css'

/**
 * LiveTrackingPage
 * 
 * Displays the live location tracking interface for GigShield
 * Shows the user's real-time GPS location on a Google Map
 * and allows them to start/stop tracking
 */

function LiveTrackingPage({ user }) {
  const [trackingStats, setTrackingStats] = useState({
    lastUpdate: null,
    totalDistance: 0,
    sessionDuration: 0,
  })
  const [lastKnownLocation, setLastKnownLocation] = useState(null)

  /**
   * Callback: Called whenever location updates
   * Updates tracking statistics
   */
  const handleLocationChange = () => {
    setTrackingStats((prev) => ({
      ...prev,
      lastUpdate: new Date().toLocaleTimeString(),
    }))

    try {
      const raw = window.localStorage.getItem('gigshield_last_tracking_location')
      if (raw) {
        setLastKnownLocation(JSON.parse(raw))
      }
    } catch {
      setLastKnownLocation(null)
    }
  }

  return (
    <div className="live-tracking-page page-shell">
      {/* Header Section */}
      <section className="tracking-header surface-card">
        <div className="header-content">
          <div className="header-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h1 className="header-title">Live Location Tracking</h1>
            <p className="header-subtitle">Track your real-time GPS location and monitor your shift zones</p>
          </div>
        </div>
      </section>

      {/* Main Map Section */}
      <section className="tracking-map-section surface-card">
        <LiveLocationMap
          onLocationChange={handleLocationChange}
          showInfoWindow={true}
          trackingInterval={5000}
        />
      </section>

      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Payout fallback</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Last tracked location stays available</h2>
            <p className="mt-1 text-sm text-slate-600">
              If tracking stops, GigShield keeps the last GPS point and uses it for the next payout calculation.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-right text-sm text-cyan-900">
            <p className="text-xs uppercase tracking-[0.14em] text-cyan-800">Last known location</p>
            <p className="mt-1 font-semibold">
              {lastKnownLocation ? `${Number(lastKnownLocation.lat).toFixed(4)}, ${Number(lastKnownLocation.lng).toFixed(4)}` : 'No saved tracking yet'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="tracking-stats">
        <div className="stat-card-small">
          <div className="stat-label">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            Last Update
          </div>
          <p className="stat-value">{trackingStats.lastUpdate || 'Waiting...'}</p>
        </div>

        <div className="stat-card-small">
          <div className="stat-label">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.5 1.5H5.75A2.25 2.25 0 003.5 3.75v12.5A2.25 2.25 0 005.75 18.5h8.5a2.25 2.25 0 002.25-2.25V6.5m-12 0h12m-12 0V3.75a2.25 2.25 0 012.25-2.25h8.5a2.25 2.25 0 012.25 2.25v2.75m-12 0h12" />
            </svg>
            Session Duration
          </div>
          <p className="stat-value">{trackingStats.sessionDuration}h 0m</p>
        </div>

        <div className="stat-card-small">
          <div className="stat-label">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" clipRule="evenodd" />
            </svg>
            Worker ID
          </div>
          <p className="stat-value text-sm">{user?.workerCompanyId || 'N/A'}</p>
        </div>

        <div className="stat-card-small">
          <div className="stat-label">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" clipRule="evenodd" />
            </svg>
            Zone
          </div>
          <p className="stat-value text-sm">{user?.zone || 'Not Set'}</p>
        </div>
      </section>

      {/* Info Section */}
      <section className="tracking-info surface-card">
        <h2 className="info-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          How It Works
        </h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-number">1</span>
            <div>
              <p className="info-item-title">Permission Request</p>
              <p className="info-item-desc">Your browser will ask for location access permission. Click "Allow" to enable GPS tracking.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-number">2</span>
            <div>
              <p className="info-item-title">Real-Time Tracking</p>
              <p className="info-item-desc">Your location updates every 5 seconds with high accuracy. The blue marker shows your current position.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-number">3</span>
            <div>
              <p className="info-item-title">Accuracy Circle</p>
              <p className="info-item-desc">The light blue circle shows your location accuracy range. Smaller circle = more accurate location.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-number">4</span>
            <div>
              <p className="info-item-title">Smooth Animation</p>
              <p className="info-item-desc">The marker smoothly animates between positions instead of jumping, for a better experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section className="tracking-tips surface-card">
        <h2 className="tips-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Safety Tips
        </h2>
        <ul className="tips-list">
          <li>Enable location access only when you need to track. You can disable it after your shift.</li>
          <li>Keep your device battery healthy - GPS tracking consumes more power than usual.</li>
          <li>Ensure your location is shared only with trusted GigShield services.</li>
          <li>If tracking shows inaccurate location, try clearing any background apps and restarting.</li>
          <li>Location data is encrypted and only used for payout verification and zone monitoring.</li>
        </ul>
      </section>
    </div>
  )
}

export default LiveTrackingPage
