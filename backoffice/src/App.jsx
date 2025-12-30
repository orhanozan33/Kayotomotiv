import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ErrorProvider } from './contexts/ErrorContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VehiclesPage from './pages/VehiclesPage'
import ReservationsPage from './pages/ReservationsPage'
import RepairServicesPage from './pages/RepairServicesPage'
import RepairQuotesPage from './pages/RepairQuotesPage'
import CarWashPage from './pages/CarWashPage'
import PagesPage from './pages/PagesPage'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'
import MessagesPage from './pages/MessagesPage'
import BackendPage from './pages/BackendPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Allow admin and user roles
        if (userData.role === 'admin' || userData.role === 'user') {
          setIsAuthenticated(true)
        }
      } catch (e) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <ErrorProvider>
      <Router basename="/admin">
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage onLogin={setIsAuthenticated} />
          } />
          <Route path="/" element={
            isAuthenticated ? <Layout /> : <Navigate to="/login" />
          }>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="vehicles" element={<VehiclesPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="repair-services" element={<RepairServicesPage />} />
            <Route path="repair-quotes" element={<RepairQuotesPage />} />
            <Route path="car-wash" element={<CarWashPage />} />
            <Route path="pages" element={<PagesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="backend" element={<BackendPage />} />
          </Route>
        </Routes>
      </Router>
    </ErrorProvider>
  )
}

export default App

