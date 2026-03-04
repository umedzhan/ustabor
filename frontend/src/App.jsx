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

  const getOnboardingRedirect = () => {
    // If we have a role but no onboarded status, direct them to their specific setup page first
    if (user.role === 'client') return '/client-setup';
    if (user.role === 'vendor') return '/vendor/register';
    if (user.role === 'admin') return '/admin';
    return '/select-role';
  };

  // Redirect to Onboarding logic if user is logged in but hasn't finished setup
  const showOnboarding = user && !user.onboarded && user.role !== 'admin';

  return (
    <Router>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg relative">
        <Routes>
          {showOnboarding ? (
            <>
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/client-setup" element={<ClientSetup />} />
              <Route path="/vendor/register" element={<VendorRegister />} />
              {/* Only redirect if the path isn't strictly one of the allowed setups */}
              <Route path="*" element={<Navigate to={getOnboardingRedirect()} replace />} />
            </>
          ) : (
            <>
              {/* Client Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/onboarding" element={<SelectRole />} />
              <Route path="/vendor/:id" element={<ProfessionalProfile />} />
              <Route path="/vendor/:id/book" element={
                user ? <OrderFlow /> : <Navigate to="/" />
              } />
              <Route path="/orders" element={
                user ? <Orders /> : <Navigate to="/" />
              } />
              <Route path="/chat/:id" element={
                user ? <Chat /> : <Navigate to="/" />
              } />
              <Route path="/chats" element={
                user ? <div className="p-10 text-center">Chatlar ro'yxati (Tez kunda)</div> : <Navigate to="/" />
              } />
              <Route path="/profile" element={
                user ? <Profile /> : <Navigate to="/" />
              } />

              {/* Vendor Routes */}
              <Route path="/vendor/register" element={
                user ? <VendorRegister /> : <Navigate to="/" />
              } />
              <Route path="/vendor/dashboard" element={
                user && user.role === 'vendor' ? <Dashboard /> : <Navigate to="/vendor/register" />
              } />
              <Route path="/vendor/profile" element={
                user && user.role === 'vendor' ? <ProfileSettings /> : <Navigate to="/" />
              } />

              {/* Shared Routes */}
              <Route path="/select-role" element={<SelectRole />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
        <BottomNav />
        <LanguageSwitcher />
      </div>
    </Router>
  );
}

export default App;
