import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Profile from './pages/Profile'
import Leaderboards from './pages/Leaderboards'
import Tournaments from './pages/Tournaments'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <h1>Lichess Explorer</h1>
          <nav>
            <Link to="/profile">Profile</Link>
            <Link to="/leaderboards">Leaderboards</Link>
            <Link to="/tournaments">Tournaments</Link>
          </nav>
        </header>
        <main>
          <div className="main-container">
            <Routes>
              <Route path="/" element={<Profile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/api/:username" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
