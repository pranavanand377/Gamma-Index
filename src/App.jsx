import { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter, Navigate, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import MyList from './pages/MyList';
import FilteredPage from './pages/FilteredPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import MyProfilePage from './pages/MyProfilePage';
import MyLibraryPage from './pages/MyLibraryPage';
import LandingPage from './pages/LandingPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import ToastContainer from './components/common/Toast';
import PageLoader from './components/common/PageLoader';
import ErrorBoundary from './components/common/ErrorBoundary';
import useAuthStore from './store/useAuthStore';
import useMediaStore from './store/useMediaStore';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const Router = import.meta.env.PROD ? HashRouter : BrowserRouter;

  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const loading = useAuthStore((s) => s.loading);
  const profileLoading = useAuthStore((s) => s.profileLoading);
  const init = useAuthStore((s) => s.init);
  const fetchItems = useMediaStore((s) => s.fetchItems);

  // Initialize auth on mount
  useEffect(() => {
    init();
  }, [init]);

  // Fetch items when user changes
  useEffect(() => {
    if (user) {
      fetchItems(user.id);
    }
  }, [user, fetchItems]);

  if (loading) {
    return <PageLoader fullScreen title="Gamma Index" subtitle="Authenticating your session" />;
  }

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </Router>
    );
  }

  if (profileLoading) {
    return <PageLoader fullScreen title="Loading Profile" subtitle="Checking access and approvals" />;
  }

  if (!profile?.approved || profile?.disabled) {
    return (
      <Router>
        <Routes>
          <Route path="/pending-approval" element={<PendingApprovalPage />} />
          <Route path="*" element={<Navigate to="/pending-approval" replace />} />
        </Routes>
        <ToastContainer />
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen min-h-[100dvh] flex-col overflow-x-hidden bg-surface-base">
        {/* Navbar */}
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Main area: Sidebar + Content */}
        <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
          <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          
          {/* Main Content Area */}
          <main className="app-scroll flex-1 min-w-0 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl min-w-0">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/my-list" element={<MyList />} />
                <Route path="/my-library" element={<MyLibraryPage />} />
                <Route path="/profile" element={<MyProfilePage />} />
                <Route path="/library/:filter" element={<FilteredPage mode="library" />} />
                <Route path="/status/:filter" element={<FilteredPage mode="status" />} />
                <Route path="/settings" element={<AccountSettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </Router>
  );
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
