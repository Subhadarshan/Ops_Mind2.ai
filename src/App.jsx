import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './layouts/DashboardLayout';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LeavePage from './pages/LeavePage';

function roleHome(user) {
  if (!user) return '/login';
  if (user.role === 'admin') return '/analytics';
  if (user.role === 'hr') return '/upload';
  return '/chat';
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/chat" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={roleHome(user)} replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={roleHome(user)} replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to={roleHome(user)} replace /> : <SignupPage />} />

      <Route element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/leave" element={<LeavePage />} />
        <Route path="/upload" element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}><UploadPage /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute allowedRoles={['admin']}><AnalyticsPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
