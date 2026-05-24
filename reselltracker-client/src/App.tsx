import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RbacProvider } from './context/RbacContext'
import { ToastProvider } from './components/ui/Toast'
import { AppLayout } from './components/layout/AppLayout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'

import Login               from './pages/Login'
import Unauthorized        from './pages/Unauthorized'
import Dashboard           from './pages/Dashboard'
import Inventory           from './pages/Inventory'
import SalesLog            from './pages/SalesLog'
import FeesTable           from './pages/FeesTable'
import Suppliers           from './pages/Suppliers'
import SkuGenerator        from './pages/SkuGenerator'
import CategoryPerformance from './pages/CategoryPerformance'
import SellThrough         from './pages/SellThrough'
import UserManagement      from './pages/UserManagement'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RbacProvider>
            <Routes>
              {/* Public */}
              <Route path="/login"        element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/"            element={<Navigate to="/dashboard" replace />} />

              {/* Protected shell */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Viewer']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Lister']}>
                    <Inventory />
                  </ProtectedRoute>
                } />
                <Route path="/sales" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Viewer']}>
                    <SalesLog />
                  </ProtectedRoute>
                } />
                <Route path="/platforms" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager']}>
                    <FeesTable />
                  </ProtectedRoute>
                } />
                <Route path="/suppliers" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager']}>
                    <Suppliers />
                  </ProtectedRoute>
                } />
                <Route path="/sku" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Lister']}>
                    <SkuGenerator />
                  </ProtectedRoute>
                } />
                <Route path="/categories" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Viewer']}>
                    <CategoryPerformance />
                  </ProtectedRoute>
                } />
                <Route path="/sell-through" element={
                  <ProtectedRoute allowedRoles={['Owner','Manager','Viewer']}>
                    <SellThrough />
                  </ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute allowedRoles={['Owner']}>
                    <UserManagement />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </RbacProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
