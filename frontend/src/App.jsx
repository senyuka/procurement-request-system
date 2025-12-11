import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import IntakeForm from './components/IntakeForm'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="container">
            <h1>askLio Procurement System</h1>
            <div className="nav-links">
              <Link to="/">New Request</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/profile">Profile</Link>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<IntakeForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
