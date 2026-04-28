import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function SitePassword() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/profiles', { replace: true })
  }, [isAuthenticated, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.post('/api/auth/verify', { password })
      if (data.success) {
        login()
        navigate('/profiles')
      } else {
        triggerShake("Hmm, that's not right! 🍴")
      }
    } catch {
      triggerShake('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  function triggerShake(message) {
    setError(message)
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FAF6F0' }}>
      <div
        className={`w-full max-w-md bg-white rounded-2xl shadow-lg p-10 ${shaking ? 'shake' : ''}`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-3">
          <Logo size={80} />
        </div>

        {/* Tagline */}
        <p className="text-center text-sm mb-8" style={{ color: '#9CA3AF', fontFamily: "'Nunito', sans-serif" }}>
          The family recipe book
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter the secret password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none text-base transition-colors"
            style={{ fontFamily: "'Nunito', sans-serif" }}
            onFocus={(e) => e.target.style.borderColor = '#C4622D'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            autoFocus
          />

          {error && (
            <p className="text-sm text-center" style={{ color: '#C4622D' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl text-white font-semibold text-base transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#C4622D', fontFamily: "'Nunito', sans-serif" }}
          >
            {loading ? 'Checking…' : "Let's Go →"}
          </button>
        </form>
      </div>
    </div>
  )
}
