import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/stores";
import { useOffline } from "./hooks/useOffline";

import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Onboarding from "./pages/onboarding/Onboarding";
import Dashboard from "./pages/student/Dashboard";
import Subjects from "./pages/student/Subjects";
import LessonView from "./pages/student/LessonView";
import Profile from "./pages/student/Profile";
import ReelsPage from "./pages/reels/ReelsPage";
import QuizHome from "./pages/quiz/QuizHome";
import QuizPlay from "./pages/quiz/QuizPlay";
import Rewards from "./pages/games/Rewards";
import AIChat from "./pages/chat/AIChat";
import OfflinePage from "./pages/offline/OfflinePage";
import HelpPage from "./pages/help/HelpPage";
import AboutPage from "./pages/about/AboutPage";
import Assignments from "./pages/student/Assignments";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import ParentDashboard from "./pages/parent/ParentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/student/NotFound";

const Guard = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleDashboard = () => {
  const { user } = useAuthStore();
  if (user?.role === "teacher") return <Navigate to="/teacher" replace />;
  if (user?.role === "parent") return <Navigate to="/parent" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <Dashboard />;
};

export default function App() {
  useOffline();
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp" element={<Navigate to="/login" replace />} />
      <Route path="/onboarding" element={<Onboarding />} />

      <Route
        path="/"
        element={
          <Guard>
            <MainLayout />
          </Guard>
        }
      >
        <Route index element={<RoleDashboard />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="lesson/:id" element={<LessonView />} />
        <Route path="lessons/:id" element={<LessonView />} />
        <Route path="profile" element={<Profile />} />
        <Route path="reels" element={<ReelsPage />} />
        <Route path="quiz" element={<QuizHome />} />
        <Route path="quiz/:id" element={<QuizPlay />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="chat" element={<AIChat />} />
        <Route path="offline" element={<OfflinePage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route
          path="teacher"
          element={
            <Guard roles={["teacher", "admin"]}>
              <TeacherDashboard />
            </Guard>
          }
        />
        <Route
          path="parent"
          element={
            <Guard roles={["parent", "admin"]}>
              <ParentDashboard />
            </Guard>
          }
        />
        <Route
          path="admin"
          element={
            <Guard roles={["admin"]}>
              <AdminDashboard />
            </Guard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
