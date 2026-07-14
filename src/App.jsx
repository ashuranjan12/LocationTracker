import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const emptyPosition = {
  latitude: null,
  longitude: null,
  accuracy: null,
  timestamp: null,
}

function formatCoordinate(value) {
  if (value === null || Number.isNaN(value)) return '—'
  return value.toFixed(5)
}

function formatTimestamp(value) {
  if (!value) return 'Waiting for signal'
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function calculateDistance(from, to) {
  if (!from || !to) return null

  const earthRadius = 6371000
  const toRadians = (value) => (value * Math.PI) / 180

  const dLat = toRadians(to.latitude - from.latitude)
  const dLon = toRadians(to.longitude - from.longitude)
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadius * c
}

function App() {
  const [status, setStatus] = useState('idle')
  const [position, setPosition] = useState(emptyPosition)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const watchIdRef = useRef(null)

  useEffect(() => {
    startTracking()

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
    }
  }, [])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setStatus('error')
      setError('Geolocation is not supported by this browser.')
      return
    }

    setStatus('tracking')
    setError('')

    navigator.geolocation.getCurrentPosition(
      (currentPosition) => {
        const nextPosition = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
          accuracy: currentPosition.coords.accuracy,
          timestamp: currentPosition.timestamp,
        }

        setPosition(nextPosition)
        setHistory((previous) => [
          ...previous.slice(-9),
          { ...nextPosition, id: `${Date.now()}-${Math.random()}` },
        ])
      },
      (geoError) => {
        setStatus('error')
        setError(geoError.message || 'Unable to access your location.')
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 },
    )

    watchIdRef.current = navigator.geolocation.watchPosition(
      (livePosition) => {
        const nextPosition = {
          latitude: livePosition.coords.latitude,
          longitude: livePosition.coords.longitude,
          accuracy: livePosition.coords.accuracy,
          timestamp: livePosition.timestamp,
        }

        setPosition(nextPosition)
        setHistory((previous) => [
          ...previous.slice(-9),
          { ...nextPosition, id: `${Date.now()}-${Math.random()}` },
        ])
      },
      (geoError) => {
        setStatus('error')
        setError(geoError.message || 'Tracking paused because permission changed.')
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 },
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    watchIdRef.current = null
    setStatus('stopped')
  }

  const clearHistory = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    watchIdRef.current = null
    setPosition(emptyPosition)
    setHistory([])
    setStatus('idle')
    setError('')
  }

  const distance = useMemo(() => {
    if (history.length < 2) return null

    const first = history[0]
    const last = history[history.length - 1]
    const meterDistance = calculateDistance(first, last)

    if (!meterDistance) return null
    return meterDistance > 1000
      ? `${(meterDistance / 1000).toFixed(2)} km`
      : `${Math.round(meterDistance)} m`
  }, [history])

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Location tracker</p>
          <h1>Keep tabs on your position in real time.</h1>
          <p className="subtitle">
            Start tracking to capture your current coordinates, accuracy, and a
            rolling history of recent samples.
          </p>
        </div>

        <div className="controls">
          <div className={`status-pill ${status}`}>
            <span className="status-dot" />
            {status === 'tracking' ? 'live tracking' : status}
          </div>
          <div className="button-row">
            <button type="button" className="primary" onClick={startTracking}>
              Start tracking
            </button>
            <button type="button" className="secondary" onClick={stopTracking}>
              Stop
            </button>
            <button type="button" className="ghost" onClick={clearHistory}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <span className="label">Latitude</span>
          <strong>{formatCoordinate(position.latitude)}</strong>
        </article>
        <article className="stat-card">
          <span className="label">Longitude</span>
          <strong>{formatCoordinate(position.longitude)}</strong>
        </article>
        <article className="stat-card">
          <span className="label">Accuracy</span>
          <strong>{position.accuracy ? `${Math.round(position.accuracy)} m` : '—'}</strong>
        </article>
        <article className="stat-card">
          <span className="label">Last update</span>
          <strong>{formatTimestamp(position.timestamp)}</strong>
        </article>
      </section>

      <section className="detail-card">
        <div className="detail-header">
          <h2>Recent points</h2>
          <span className="distance-pill">{distance ?? 'No movement yet'}</span>
        </div>
        {history.length === 0 ? (
          <p className="empty-state">
            No location samples yet. Start tracking and allow browser permissions.
          </p>
        ) : (
          <ul className="history-list">
            {history
              .slice()
              .reverse()
              .map((entry) => (
                <li key={entry.id}>
                  <span>{formatTimestamp(entry.timestamp)}</span>
                  <strong>
                    {formatCoordinate(entry.latitude)}, {formatCoordinate(entry.longitude)}
                  </strong>
                </li>
              ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
