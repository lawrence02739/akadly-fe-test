import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './features/auth/pages/Login';
import DashboardLayout from './shared/layouts/DashboardLayout';
import CoursesDashboard from './features/courses/pages/CoursesDashboard';
import CourseEditor from './features/courses/pages/CourseEditor';
import CourseStructureBuilder from './features/courses/pages/CourseStructureBuilder';
import QuizStudioPage from './features/quizzes/pages/QuizStudioPage';
import TestStudioPage from './features/tests/TestStudioPage';
import QuestionBankPage from './features/questions/components/QuestionBankPage';

import Signup from './features/auth/pages/Signup';
import VerifyEmail from './features/auth/pages/VerifyEmail';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import AuthCallback from './features/auth/pages/AuthCallback';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes (Static for now) */}
        <Route path="/partner" element={<DashboardLayout />}>
          <Route path="courses" element={<CoursesDashboard />} />
          <Route path="courses/create" element={<CourseEditor />} />
          <Route path="courses/:courseId/edit" element={<CourseEditor />} />
          <Route path="courses/:courseId/structure" element={<CourseStructureBuilder />} />
          <Route path="quiz-studio" element={<QuizStudioPage />} />
          <Route path="test-studio" element={<TestStudioPage />} />
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route index element={<Navigate to="/partner/courses" replace />} />
        </Route>

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
