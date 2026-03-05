import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import OrderFlow from './pages/Client/OrderFlow';
import Orders from './pages/Client/Orders';
import Chat from './pages/Client/Chat';
import ClientSetup from './pages/Client/ClientSetup';
import Dashboard from './pages/Vendor/Dashboard';
import VendorRegister from './pages/Vendor/Register';
import ProfileSettings from './pages/Vendor/ProfileSettings';
import Admin from './pages/Admin';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import SelectRole from './pages/SelectRole';
import BottomNav from './components/BottomNav';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Is the user fully onboarded?
  const isOnboarded = user && user.onboarded;
  const isAdmin = user && user.role === 'admin';

  // Where should a non-onboarded user go?
  const getOnboardingPath = () => {
    if (!user) return '/select-role';
    if (user.role === 'client') return '/client-setup';
    if (user.role === 'vendor') return '/vendor/register';
    return '/select-role';
  };

  // Guard: redirect un-onboarded users to their setup page
  const RequireOnboarding = ({ children }) => {
    if (!isOnboarded && !isAdmin) return <Navigate to={getOnboardingPath()} replace />;
    return children;
  };

  return (
    <Router>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg relative">
        <Routes>
          {/* Onboarding Routes - always accessible */}
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/client-setup" element={<ClientSetup />} />
          <Route path="/vendor/register" element={<VendorRegister />} />

          {/* Admin Route */}
          <Route path="/admin" element={<Admin />} />

          {/* Main App Routes - require completed onboarding */}
          <Route path="/" element={<RequireOnboarding><Home /></RequireOnboarding>} />
          <Route path="/onboarding" element={<SelectRole />} />
          <Route path="/vendor/:id" element={<ProfessionalProfile />} />
          <Route path="/vendor/:id/book" element={<RequireOnboarding><OrderFlow /></RequireOnboarding>} />
          <Route path="/orders" element={<RequireOnboarding><Orders /></RequireOnboarding>} />
          <Route path="/chat/:id" element={<RequireOnboarding><Chat /></RequireOnboarding>} />
          <Route path="/chats" element={<RequireOnboarding><div className="p-10 text-center">Chatlar ro'yxati (Tez kunda)</div></RequireOnboarding>} />
          <Route path="/profile" element={<RequireOnboarding><Profile /></RequireOnboarding>} />

          {/* Vendor-specific Routes */}
          <Route path="/vendor/dashboard" element={
            user && user.role === 'vendor' ? <Dashboard /> : <Navigate to="/select-role" replace />
          } />
          <Route path="/vendor/profile" element={<RequireOnboarding><ProfileSettings /></RequireOnboarding>} />


          {/* Shared */}
          <Route path="/select-role" element={<SelectRole />} />

          {/* Catch-all */}
          <Route path="*" element={
            (isOnboarded || isAdmin)
              ? <Navigate to="/" replace />
              : <Navigate to={getOnboardingPath()} replace />
          } />
        </Routes>
        <BottomNav />
        <LanguageSwitcher />
      </div>
    </Router>
  );
}

export default App;
