import { Route, Routes } from 'react-router'
import LoginPage from './auth/LoginPage'
function App() {
  return (
    <div>
      <Routes>
        <Route path="/about" element={<div>About</div>} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App
