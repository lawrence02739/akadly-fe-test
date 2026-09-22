import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./features/auth/pages/Login";
import DashboardLayout from "./shared/layouts/DashboardLayout";
import CoursesDashboard from "./features/courses/pages/CoursesDashboard";
import CourseEditor from "./features/courses/pages/CourseEditor";
import CourseStructureBuilder from "./features/courses/pages/CourseStructureBuilder";
import QuizStudioPage from "./features/quizzes/pages/QuizStudioPage";
import TestStudioPage from "./features/tests/TestStudioPage";
import QuestionBankPage from "./features/questions/components/QuestionBankPage";
import FormsDashboard from "./features/form-builder/pages/FormsDashboard";
import { FormBuilderLayout } from "./features/form-builder/components/FormBuilderLayout";
import { PublicFormPage } from "./features/form-builder/components/PublicFormPage";

import Signup from "./features/auth/pages/Signup";
import VerifyEmail from "./features/auth/pages/VerifyEmail";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import ResetPassword from "./features/auth/pages/ResetPassword";
import AuthCallback from "./features/auth/pages/AuthCallback";
import WorkspacePage from "./shared/pages/WorkspacePage";
import TeamAccessPage from "./features/team/pages/TeamAccessPage";
import AcceptInvitation from "./features/team/pages/AcceptInvitation";
import AccessRoute from "./shared/auth/AccessRoute";
import {
  BarChart2,
  Calendar,
  ClipboardList,
  Home,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

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
        <Route path="/accept-invite" element={<AcceptInvitation />} />

        {/* Protected Routes (Static for now) */}
        <Route path="/partner" element={<DashboardLayout />}>
          <Route
            path="home"
            element={
              <AccessRoute anyOf={["dashboard:read"]}>
                <WorkspacePage
                  title="Home"
                  description="Your workspace overview and recent activity."
                  icon={Home}
                />
              </AccessRoute>
            }
          />
          <Route
            path="courses"
            element={
              <AccessRoute anyOf={["course:read", "course:manage"]}>
                <CoursesDashboard />
              </AccessRoute>
            }
          />
          <Route
            path="courses/create"
            element={
              <AccessRoute anyOf={["course:manage"]}>
                <CourseEditor />
              </AccessRoute>
            }
          />
          <Route path="forms" element={<AccessRoute anyOf={["form:read", "form:manage"]}><FormsDashboard /></AccessRoute>} />
          <Route path="forms/create" element={<AccessRoute anyOf={["form:manage"]}><FormBuilderLayout /></AccessRoute>} />
          <Route path="forms/:formId/edit" element={<AccessRoute anyOf={["form:read", "form:manage"]}><FormBuilderLayout /></AccessRoute>} />
          <Route
            path="courses/:courseId/edit"
            element={
              <AccessRoute anyOf={["course:manage"]}>
                <CourseEditor />
              </AccessRoute>
            }
          />
          <Route
            path="courses/:courseId/structure"
            element={
              <AccessRoute anyOf={["curriculum:read", "curriculum:manage"]}>
                <CourseStructureBuilder />
              </AccessRoute>
            }
          />
          <Route
            path="users"
            element={
              <AccessRoute anyOf={["member:read"]}>
                <TeamAccessPage />
              </AccessRoute>
            }
          />
          <Route path="quiz-studio" element={<QuizStudioPage />} />
          <Route path="test-studio" element={<TestStudioPage />} />
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route
            path="tasks"
            element={
              <AccessRoute anyOf={["task:read", "task:manage"]}>
                <WorkspacePage
                  title="Tasks"
                  description="Track assignments and work that needs attention."
                  icon={ClipboardList}
                />
              </AccessRoute>
            }
          />
          <Route
            path="calendar"
            element={
              <AccessRoute anyOf={["calendar:read", "calendar:manage"]}>
                <WorkspacePage
                  title="Calendar"
                  description="View classes, deadlines, and upcoming events."
                  icon={Calendar}
                />
              </AccessRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <AccessRoute anyOf={["analytics:read"]}>
                <WorkspacePage
                  title="Analytics"
                  description="Review course performance and learner engagement."
                  icon={BarChart2}
                />
              </AccessRoute>
            }
          />
          <Route
            path="messages"
            element={
              <AccessRoute
                anyOf={["message:read", "message:send", "message:manage"]}
              >
                <WorkspacePage
                  title="Messages"
                  description="Read and manage workspace conversations."
                  icon={MessageSquare}
                />
              </AccessRoute>
            }
          />
          <Route
            path="search"
            element={
              <AccessRoute anyOf={["search:use"]}>
                <WorkspacePage
                  title="Search"
                  description="Search across your workspace, courses, and users."
                  icon={Search}
                />
              </AccessRoute>
            }
          />
          <Route
            path="ai-assistant"
            element={
              <AccessRoute anyOf={["ai:use", "ai:manage"]}>
                <WorkspacePage
                  title="AI Assistant"
                  description="Create and refine learning content with AI."
                  icon={Sparkles}
                />
              </AccessRoute>
            }
          />
          <Route
            path="settings"
            element={
              <AccessRoute anyOf={["settings:read", "settings:manage"]}>
                <WorkspacePage
                  title="Settings"
                  description="Configure your workspace and account preferences."
                  icon={Settings}
                />
              </AccessRoute>
            }
          />
          <Route index element={<Navigate to="home" replace />} />
          <Route path="*" element={<Navigate to="home" replace />} />
        </Route>

        {/* Redirect Root to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/f/:id" element={<PublicFormPage />} />
      </Routes>
    </Router>
  );
}

export default App;
