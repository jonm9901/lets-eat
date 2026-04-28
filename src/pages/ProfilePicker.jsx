import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function ProfilePicker() {
  const { isAuthenticated, setActiveUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true })
      return
    }
    axios.get('/api/users').then(({ data }) => {
      const sorted = [...data].sort((a, b) => (a.name === 'Wendy' ? -1 : b.name === 'Wendy' ? 1 : 0))
      setUsers(sorted)
      setLoading(false)
    })
  }, [isAuthenticated, navigate])

  function handleSelectUser(user) {
    setActiveUser(user)
    navigate('/library')
  }

  function getInitial(name) {
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#FAF6F0' }}>
      <h1
        className="text-4xl font-bold text-center mb-2"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C1C1C' }}
      >
        Who's cooking tonight?
      </h1>
      <p className="text-center mb-12 text-lg" style={{ color: '#9CA3AF' }}>👋 Pick your profile</p>

      {loading ? (
        <div className="flex gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-16 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="flex flex-col items-center gap-3 group cursor-pointer bg-transparent border-none"
            >
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
                style={{
                  backgroundColor: user.avatar_color,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {getInitial(user.name)}
              </div>
              <span
                className="text-lg font-semibold transition-colors duration-200"
                style={{ fontFamily: "'Nunito', sans-serif", color: '#1C1C1C' }}
              >
                {user.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
