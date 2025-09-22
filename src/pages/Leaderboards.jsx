import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLeaderboards } from '../api/lichess'

function PlayerRow({ p }) {
  // p may have different shapes; try to normalize
  const username = p.username || p.name || p.id
  const title = p.title || (p.user && p.user.title) || ''
  const perfs = p.perfs || p.user?.perfs || {}
  const getRating = k => (perfs[k] ? perfs[k].rating : p.rating || '—')

  return (
    <div className="player">
      <div className="player-left">
        <Link to={`/api/${username}`} className="player-name">{username}</Link>
        {title && <span className="muted"> {title}</span>}
      </div>
      <div className="player-right">
        <span>Blitz: <strong>{getRating('blitz')}</strong></span>
        <span>Rapid: <strong>{getRating('rapid')}</strong></span>
        <span>Classical: <strong>{getRating('classical')}</strong></span>
      </div>
    </div>
  )
}

export default function Leaderboards() {
  const [boards, setBoards] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    getLeaderboards().then(data => {
      if (!mounted) return
      setBoards(data)
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
      <h2>Leaderboards</h2>
      {loading && <p>Loading...</p>}
  {error && <p className="error">{String(error).replace(/<[^>]+>/g, '').slice(0,100)}{String(error).length>100? '...':''}</p>}
      {boards && (
        <div className="card">
          <p>Top players by category</p>
          {(() => {
            // boards may be { blitz: [...], rapid: [...], classical: [...] }
            // or fallback: { top: [...] }
            const keys = Object.keys(boards)
            return keys.map(category => {
              const list = boards[category] || []
              const arr = Array.isArray(list) ? list : (list.players || [])
              return (
                <div key={category} className="board">
                  <h4>{category}</h4>
                  <div className="players">
                    {arr.map(p => (
                      <PlayerRow key={p.id || p.username || (p && p.user && p.user.id)} p={p} />
                    ))}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      )}
    </div>
  )
}
