import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile } from '../api/lichess'

export default function Profile() {
  const params = useParams()
  const navigate = useNavigate()
  const initial = params.username || 'magnuscarlsen'
  const [username, setUsername] = useState(initial)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function load(e) {
    if (e && e.preventDefault) e.preventDefault()
    const name = username.trim()
    if (!name) {
      setError('Enter a username')
      return
    }
    // update URL so it's shareable
    if (!params.username || params.username !== name) {
      navigate(`/api/${encodeURIComponent(name)}`, { replace: false })
    }
    setLoading(true)
    setError(null)
    try {
      const r = await getUserProfile(name)
      setData(r)
    } catch (e) {
      setError(e.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  // If the route param changes (user visits /api/:username), load automatically
  useEffect(() => {
    if (params.username && params.username !== username) {
      setUsername(params.username)
      // load the new username
      ;(async () => {
        setLoading(true)
        setError(null)
        try {
          const r = await getUserProfile(params.username)
          setData(r)
        } catch (e) {
          setError(e.message)
          setData(null)
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [params.username])

  const ratings = (data && data.perfs) || {}
  const getRating = key => (ratings[key] ? ratings[key].rating : '—')
  const getGames = key => (ratings[key] ? ratings[key].games : 0)

  return (
    <div className="page">
      <h2>Profile</h2>
      <form className="controls" onSubmit={load}>
        <input aria-label="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="Enter lichess username" />
        <button type="submit">Load</button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && (
        <div className="card profile-card">
          <div className="profile-left">
            <img className="avatar" src={data.profile && data.profile.bio ? data.profile.avatar : data.avatar || (`https://lichess1.org/assets/images/lichess-bird.svg`)} alt="avatar" />
            <div className="basic">
              <h3>{data.username} <small className="muted">{data.title || ''}</small></h3>
              <p className="muted">{data.profile && data.profile.country ? data.profile.country : ''}</p>
            </div>
          </div>
          <div className="profile-right">
            <p className="bio">{data.bio || (data.profile && data.profile.bio) || 'No bio available.'}</p>
            <div className="stats">
              <div><strong>Games:</strong> {data.count && data.count.games ? data.count.games : (data.playedGames || '—')}</div>
              <div><strong>Blitz:</strong> {getRating('blitz')} <span className="muted">({getGames('blitz')} games)</span></div>
              <div><strong>Rapid:</strong> {getRating('rapid')} <span className="muted">({getGames('rapid')} games)</span></div>
              <div><strong>Classical:</strong> {getRating('classical')} <span className="muted">({getGames('classical')} games)</span></div>
            </div>
            <p className="links"><a href={`https://lichess.org/@/${data.username}`} target="_blank">View on Lichess</a></p>
          </div>
        </div>
      )}
    </div>
  )
}
