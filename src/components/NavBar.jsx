import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function NavBar() {
  const { activeUser, switchProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const showNav =
    location.pathname.startsWith('/library') ||
    location.pathname.startsWith('/calendar') ||
    location.pathname.startsWith('/recipes')

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!showNav || !activeUser) return null

  function handleSwitchProfile() {
    setDropdownOpen(false)
    switchProfile()
    navigate('/profiles')
  }

  function isActive(path) {
    return location.pathname.startsWith(path)
  }

  const linkStyle = (path) => ({
    fontFamily: "'Nunito', sans-serif",
    color: isActive(path) ? '#C4622D' : '#6B7280',
    borderBottom: isActive(path) ? '2px solid #C4622D' : '2px solid transparent',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    paddingBottom: 2,
    transition: 'color 150ms',
  })

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        {/* Main row */}
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/library" className="flex items-center no-underline flex-shrink-0">
            <Logo size={34} />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/library" style={linkStyle('/library')}>Home</Link>
            <Link to="/calendar" style={linkStyle('/calendar')}>Calendar</Link>
          </div>

          {/* User avatar + dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: activeUser.avatar_color, fontFamily: "'Playfair Display', serif" }}
              >
                {activeUser.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold hidden sm:block" style={{ fontFamily: "'Nunito', sans-serif", color: '#1C1C1C' }}>
                {activeUser.name}
              </span>
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={handleSwitchProfile}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent"
                  style={{ fontFamily: "'Nunito', sans-serif", color: '#1C1C1C' }}
                >
                  Switch Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile nav links — second row */}
        <div className="sm:hidden flex gap-6 pb-2">
          <Link to="/library" style={linkStyle('/library')}>Home</Link>
          <Link to="/calendar" style={linkStyle('/calendar')}>Calendar</Link>
        </div>
      </div>
    </nav>
  )
}
