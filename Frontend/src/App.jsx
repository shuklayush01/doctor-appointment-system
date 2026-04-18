import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login            from '/pages/Login'
import Register         from '/pages/Register'
import DoctorList       from '/pages/DoctorList'
import BookAppointment  from '/pages/BookAppointment'
import Dashboard        from '/pages/Dashboard'
import DoctorDashboard  from '/pages/DoctorDashboard'
import Navbar           from '/components/Navbar'
import Reschedule from '/pages/Reschedule'
import AdminPanel from '/pages/AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
            <Routes>
  <Route path="/"                 element={<Navigate to="/login" />} />
  <Route path="/login"            element={<Login />} />
  <Route path="/register"         element={<Register />} />
  <Route path="/doctors"          element={<DoctorList />} />
  <Route path="/book/:id"         element={<BookAppointment />} />
  <Route path="/dashboard"        element={<Dashboard />} />
  <Route path="/reschedule/:id"   element={<Reschedule />} />
  <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
  <Route path="/admin" element={<AdminPanel />} />
            </Routes>
    </BrowserRouter>
  )
}

export default App