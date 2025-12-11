import { useState, useEffect } from 'react'
import './Profile.css'

export default function Profile() {
  const [profile, setProfile] = useState({
    requestor_name: '',
    department: ''
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load profile from localStorage on mount
    const savedProfile = localStorage.getItem('userProfile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
    setSaved(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('userProfile', JSON.stringify(profile))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleClear = () => {
    setProfile({
      requestor_name: '',
      department: ''
    })
    localStorage.removeItem('userProfile')
    setSaved(false)
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        <p className="profile-description">
          Set your default information to simplify request submission. These values will automatically populate new requests, but you can always change them per request.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="requestor_name">Your Name *</label>
            <input
              type="text"
              id="requestor_name"
              name="requestor_name"
              value={profile.requestor_name}
              onChange={handleChange}
              placeholder="e.g., John Doe"
              required
            />
            <span className="field-hint">This will be used as the default requestor name</span>
          </div>

          <div className="form-group">
            <label htmlFor="department">Default Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={profile.department}
              onChange={handleChange}
              placeholder="e.g., IT, Finance, HR"
            />
            <span className="field-hint">Optional - You can submit requests for different departments</span>
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn-save">
              Save Profile
            </button>
            <button type="button" className="btn-clear" onClick={handleClear}>
              Clear Profile
            </button>
          </div>

          {saved && (
            <div className="save-notification">
              ✓ Profile saved successfully!
            </div>
          )}
        </form>

        <div className="profile-info">
          <h3>How it works</h3>
          <ul>
            <li>Your name and department will auto-fill when creating new requests</li>
            <li>You can change these values for any specific request</li>
            <li>You can submit requests for different departments anytime</li>
            <li>Your profile is stored locally in your browser</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
