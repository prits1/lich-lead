const BASE = 'https://lichess.org/api';

function isJsonLike(contentType) {
  if (!contentType) return false
  const ct = contentType.toLowerCase()
  return ct.includes('application/json') || ct.includes('+json') || ct.includes('vnd.lichess')
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json, application/vnd.lichess.v3+json, */*' } });
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    const text = await res.text();
    const stripped = text.replace(/<[^>]+>/g, '')
    const msg = stripped.trim().slice(0, 500) || res.statusText || `HTTP ${res.status}`
    throw new Error(msg)
  }
  if (!isJsonLike(contentType)) {
    const text = await res.text()
    const stripped = text.replace(/<[^>]+>/g, '').trim()
    const excerpt = stripped.slice(0, 500)
    throw new Error(`Expected JSON from Lichess API but received: ${excerpt || contentType}`)
  }
  return res.json();
}

async function fetchMaybeJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json, application/vnd.lichess.v3+json, */*' } })
  const contentType = res.headers.get('content-type') || ''
  const text = await res.text()
  if (isJsonLike(contentType)) {
    try {
      return { ok: res.ok, json: JSON.parse(text) }
    } catch (e) {
      return { ok: res.ok, text }
    }
  }
  return { ok: res.ok, text, contentType }
}

export async function getUserProfile(username) {
  if (!username) throw new Error('username required');
  return fetchJson(`${BASE}/user/${encodeURIComponent(username)}`);
}

export async function getLeaderboards() {
  // Prefer the generic `/api/player` top list which returns top10 for many perfs
  try {
    const generic = await fetchMaybeJson(`${BASE}/player`)
    if (generic && generic.json) return generic.json
  } catch (e) {
    // fallthrough to try other endpoints
  }

  // Try per-performance top endpoints (documented as `/api/player/top/{nb}/{perf}`)
  const perfs = ['blitz', 'rapid', 'classical']
  const results = await Promise.all(perfs.map(p => fetchMaybeJson(`${BASE}/player/top/100/${p}`)))
  const out = {}
  let any = false
  for (let i = 0; i < perfs.length; i++) {
    const p = perfs[i]
    const r = results[i]
    if (r && r.json) {
      out[p] = r.json
      any = true
    }
  }
  if (any) return out

  // Final fallback: try `/api/player/top` or `/api/player/top?perf=` variants
  const fb1 = await fetchMaybeJson(`${BASE}/player/top`)
  if (fb1 && fb1.json) return fb1.json

  const fb2 = await fetchMaybeJson(`${BASE}/player/top?perf=blitz`)
  if (fb2 && fb2.json) return fb2.json

  // If still no JSON, produce an error message with short excerpts
  const excerpts = results.map(r => (r && r.text) ? r.text.replace(/<[^>]+>/g, '').slice(0, 200) : (r && r.contentType) ? r.contentType : '').filter(Boolean)
  throw new Error('Lichess leaderboards returned non-JSON responses: ' + (excerpts.join(' | ') || 'no response'))
}

export async function getTournaments() {
  return fetchJson(`${BASE}/tournament`);
}

export default { getUserProfile, getLeaderboards, getTournaments };
