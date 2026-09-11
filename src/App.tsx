import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import CoursesDashboard from './pages/Courses/CoursesDashboard';

import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Routes (Static for now) */}
        <Route path="/partner" element={<DashboardLayout />}>
          <Route path="courses" element={<CoursesDashboard />} />
          <Route index element={<Navigate to="/partner/courses" replace />} />
        </Route>

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
