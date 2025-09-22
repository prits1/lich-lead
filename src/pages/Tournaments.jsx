import { useEffect, useState } from 'react'
import { getTournaments } from '../api/lichess'

export default function Tournaments() {
  const [tournaments, setTournaments] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    getTournaments().then(data => {
      if (!mounted) return
      setTournaments(data)
      setLoading(false)
    }).catch(e => {
      if (!mounted) return
      setError(e.message)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="page">
      <h2>Tournaments</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {tournaments && (
        <div className="card">
          <p>Ongoing tournaments</p>
          <div className="tournament-list">
            {(tournaments.ongoing || tournaments.started || tournaments.ongoing || []).length === 0 && <p>No ongoing tournaments found.</p>}
            {(tournaments.ongoing || tournaments.started || tournaments.ongoing || []).map(t => (
              <div className="tournament" key={t.id}>
                <div className="tournament-title"><strong>{t.fullName || t.name}</strong></div>
                <div className="tournament-meta">
                  <span>Type: {t.system || t.variant?.name || '—'}</span>
                  <span>Players: {t.nbPlayers ?? '—'}</span>
                  <span>Started: {t.startsAt ? new Date(t.startsAt).toLocaleString() : '—'}</span>
                  <span>Status: {t.status || t.state || '—'}</span>
                </div>
                {t.url && <a href={t.url} target="_blank" rel="noopener noreferrer">View on Lichess</a>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
