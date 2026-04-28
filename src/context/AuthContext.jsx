import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeUser, setActiveUserState] = useState(null)

  useEffect(() => {
    const auth = localStorage.getItem('lets_eat_auth')
    const user = localStorage.getItem('lets_eat_user')
    if (auth === 'true') setIsAuthenticated(true)
    if (user) {
      try { setActiveUserState(JSON.parse(user)) } catch { /* ignore */ }
    }
  }, [])

  function login() {
    localStorage.setItem('lets_eat_auth', 'true')
    setIsAuthenticated(true)
  }

  function setActiveUser(user) {
    localStorage.setItem('lets_eat_user', JSON.stringify(user))
    setActiveUserState(user)
  }

  function switchProfile() {
    localStorage.removeItem('lets_eat_user')
    setActiveUserState(null)
  }

  function logout() {
    localStorage.removeItem('lets_eat_auth')
    localStorage.removeItem('lets_eat_user')
    setIsAuthenticated(false)
    setActiveUserState(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, activeUser, login, setActiveUser, switchProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
