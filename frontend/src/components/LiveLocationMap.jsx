import { useEffect, useRef, useState } from 'react'
import { GoogleMap, Marker, useJsApiLoader, Circle, InfoWindow } from '@react-google-maps/api'
import './LiveLocationMap.css'

/**
 * LiveLocationMap Component
 * Displays a Google Map with real-time user location tracking
 * Features: Live GPS location updates, smooth marker animation, error handling
 */

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
const LAST_LOCATION_KEY = 'gigshield_last_tracking_location'

const DEFAULT_CENTER = {
  lat: 28.7041,
  lng: 77.1025,
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1rem',
}

const mapOptions = {
  zoom: 16,
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  fullscreenControl: true,
  streetViewControl: true,
}

export default function LiveLocationMap({ onLocationChange, showInfoWindow = true }) {
  const [currentLocation, setCurrentLocation] = useState(null)
  const [displayLocation, setDisplayLocation] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState(null)
  const [accuracy, setAccuracy] = useState(null)

  const watchIdRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastUpdateRef = useRef(null)

  const persistLastLocation = (location) => {
    try {
      window.localStorage.setItem(
        LAST_LOCATION_KEY,
        JSON.stringify({
          ...location,
          updatedAt: new Date().toISOString(),
        }),
      )
    } catch {
      // Ignore storage errors in browsers that block localStorage.
    }
  }

  const loadLastLocation = () => {
    try {
      const raw = window.localStorage.getItem(LAST_LOCATION_KEY)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
        return { lat: parsed.lat, lng: parsed.lng }
      }
    } catch {
      return null
    }

    return null
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const animateMarker = (start, end) => {
    const startTime = Date.now()
    const duration = 1000
    const startLat = start.lat
    const startLng = start.lng
    const endLat = end.lat
    const endLng = end.lng

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentLat = startLat + (endLat - startLat) * progress
      const currentLng = startLng + (endLng - startLng) * progress

      setDisplayLocation({
        lat: currentLat,
        lng: currentLng,
      })

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animate()
  }

  const handleLocationSuccess = (position) => {
    const { latitude, longitude, accuracy: acc } = position.coords
    const newLocation = { lat: latitude, lng: longitude }

    setAccuracy(Math.round(acc))
    setError(null)

    if (displayLocation) {
      animateMarker(displayLocation, newLocation)
    } else {
      setDisplayLocation(newLocation)
    }

    setCurrentLocation(newLocation)

    if (onLocationChange) {
      onLocationChange(newLocation)
    }

    persistLastLocation(newLocation)

    lastUpdateRef.current = Date.now()
  }

  const handleLocationError = (locationError) => {
    setIsTracking(false)
    let errorMessage = 'Failed to get location'

    if (locationError.code === locationError.PERMISSION_DENIED) {
      errorMessage = 'Location permission denied. Please enable it in browser settings.'
    } else if (locationError.code === locationError.POSITION_UNAVAILABLE) {
      errorMessage = 'Location information is unavailable.'
    } else if (locationError.code === locationError.TIMEOUT) {
      errorMessage = 'Location request timeout. Try again.'
    }

    setError(errorMessage)
    console.error('Geolocation error:', errorMessage)
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationSuccess(position)

        watchIdRef.current = navigator.geolocation.watchPosition(handleLocationSuccess, handleLocationError, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        })
      },
      handleLocationError,
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    )
  }

  const stopTracking = () => {
    setIsTracking(false)

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  useEffect(() => {
    const lastLocation = loadLastLocation()
    if (lastLocation) {
      setCurrentLocation(lastLocation)
      setDisplayLocation(lastLocation)
    }

    startTracking()

    return () => {
      stopTracking()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Map failed to load</p>
          <p className="text-red-500 text-sm mt-2">{loadError.message}</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-lg">
        <div className="text-slate-600">Loading map...</div>
      </div>
    )
  }

  const mapCenter = displayLocation || currentLocation || DEFAULT_CENTER

  return (
    <div className="live-location-container">
      <div className="live-location-map-wrapper">
        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={16} options={mapOptions}>
          {displayLocation && (
            <>
              <Marker 
                position={displayLocation} 
                title="Your Current Location"
                icon={{
                  path: window.google?.maps?.SymbolPath?.CIRCLE,
                  scale: 8,
                  fillColor: '#0284c7',
                  fillOpacity: 1,
                  strokeColor: '#fff',
                  strokeWeight: 2,
                }}
              />

              {accuracy && (
                <Circle
                  center={displayLocation}
                  radius={accuracy}
                  options={{
                    fillColor: '#0284c7',
                    fillOpacity: 0.1,
                    strokeColor: '#0284c7',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                  }}
                />
              )}

              {showInfoWindow && (
                <InfoWindow position={displayLocation}>
                  <div className="info-window">
                    <p className="font-semibold text-slate-800">Your Location</p>
                    <p className="text-xs text-slate-600 mt-1">Lat: {displayLocation.lat.toFixed(4)}</p>
                    <p className="text-xs text-slate-600">Lng: {displayLocation.lng.toFixed(4)}</p>
                    {accuracy && <p className="text-xs text-slate-600 mt-1">Accuracy: ±{accuracy}m</p>}
                  </div>
                </InfoWindow>
              )}
            </>
          )}
        </GoogleMap>
      </div>

      <div className="live-location-controls">
        <div className="controls-status">
          <span className={`status-badge ${isTracking ? 'active' : 'inactive'}`}>
            <span className="status-dot"></span>
            {isTracking ? 'Live Tracking' : 'Not Tracking'}
          </span>
          {accuracy && <span className="accuracy-badge">±{accuracy}m</span>}
        </div>

        {error && (
          <div className="error-message">
            <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="controls-buttons">
          {!isTracking ? (
            <button className="btn btn-primary" onClick={startTracking}>
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" clipRule="evenodd" />
              </svg>
              Start Tracking
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopTracking}>
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Stop Tracking
            </button>
          )}

          <button className="btn btn-secondary" onClick={() => {
            if (displayLocation) {
              window.location.reload()
            }
          }}>
            <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 5.199V3a1 1 0 01-1-1zm.008 9a1 1 0 011.992 0A5.002 5.002 0 0014.001 14.9v2.101a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 11 1.885-.666z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>

        {currentLocation && (
          <div className="location-info">
            <p className="info-label">Current Coordinates:</p>
            <p className="info-value">
              {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
            <p className="info-timestamp">Last updated: Just now</p>
          </div>
        )}
      </div>
    </div>
  )
}
