import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import SitePassword from './pages/SitePassword'
import ProfilePicker from './pages/ProfilePicker'
import Library from './pages/Library'
import RecipeDetail from './pages/RecipeDetail'
import Calendar from './pages/Calendar'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} style={{ animation: 'fadeIn 0.2s ease' }}>
      <Routes>
        <Route path="/" element={<SitePassword />} />
        <Route path="/profiles" element={<ProfilePicker />} />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <NavBar />
          <AnimatedRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
