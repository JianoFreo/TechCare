import { Navigate, Route, Routes } from 'react-router'
import AdminDashboard from './users/admin/AdminDashboard'
import LoginPage from './auth/LoginPage'

function App() {

  return (
    <div>
      <Routes>
        <Route path="/about" element={<div>About</div>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

export default App
