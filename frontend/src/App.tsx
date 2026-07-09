import { Navigate, Route, Routes } from 'react-router'
import LoginPage from './auth/LoginPage'
import SignupPage from './auth/SignupPage'
import Admin from './users/admin/Admin'
import DoctorDashboard from './users/doctor/DoctorDashboard'
import FrontdeskStaff from './users/frontdesk_staff/FrontdeskStaff'
import LabstaffDashboard from './users/laboratory_staff/pages/LabstaffDashbaord'
import PatientInformation from './users/patient/PatientInformation'
import QueueTracking from './queue/QueueTracking'
function App() {

  return (
    <div>
      <Routes>
        <Route path="/about" element={<div>About</div>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage  />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/patient" element={<PatientInformation />} />
        <Route path="/laboratory-staff" element={<LabstaffDashboard />} />
        <Route path="/frontdesk-staff" element={<FrontdeskStaff />} />
        <Route path="/queue-tracking" element={<QueueTracking />} />
        
      </Routes>
    </div>
  )
}

export default App
