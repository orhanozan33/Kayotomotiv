import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorProvider } from './contexts/ErrorContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import AutoSalesPage from './pages/AutoSalesPage'
import AutoSalesDetailPage from './pages/AutoSalesDetailPage'
import AutoRepairPage from './pages/AutoRepairPage'
import AutoBodyShopPage from './pages/AutoBodyShopPage'
import CarWashPage from './pages/CarWashPage'
import ContactPage from './pages/ContactPage'

function App() {
  return (
    <ErrorProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auto-sales" element={<AutoSalesPage />} />
            <Route path="/auto-sales/:id" element={<AutoSalesDetailPage />} />
            <Route path="/auto-repair" element={<AutoRepairPage />} />
            <Route path="/auto-body-shop" element={<AutoBodyShopPage />} />
            <Route path="/car-wash" element={<CarWashPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorProvider>
  )
}

export default App


