import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, activeUser } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (!activeUser) return <Navigate to="/profiles" replace />
  return children
}
