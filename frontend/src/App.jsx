import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ProfessionalProfile from './pages/ProfessionalProfile';
import OrderFlow from './pages/Client/OrderFlow';
import Chat from './pages/Client/Chat';
import Dashboard from './pages/Vendor/Dashboard';
import VendorRegister from './pages/Vendor/Register';
import ProfileSettings from './pages/Vendor/ProfileSettings';
import Admin from './pages/Admin';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="max-w-md mx-auto bg-gray-50 min-h-screen shadow-lg relative">
        <Routes>
          {/* Client Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/vendor/:id" element={<ProfessionalProfile />} />
          <Route path="/vendor/:id/book" element={
            user ? <OrderFlow /> : <Navigate to="/" />
          } />
          <Route path="/chat/:id" element={
            user ? <Chat /> : <Navigate to="/" />
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

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
