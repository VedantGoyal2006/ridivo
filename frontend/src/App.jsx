import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import VerificationPage from './pages/VerificationPage'
import AdminPage from './pages/AdminPage'
import RidesPage from './pages/RidesPage'
import BookingsPage from './pages/BookingsPage'

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      const base64 = token.split('.')[1];
      const decoded = JSON.parse(atob(base64));
      login(token, { id: decoded.id, is_admin: decoded.is_admin });
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0B1120' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: '#38BDF8' }}>
        Logging you in...
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
<Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute><EditProfilePage /></ProtectedRoute>
        } />
        <Route path="/verify" element={
          <ProtectedRoute><VerificationPage /></ProtectedRoute>
        } />
        <Route path="/rides" element={
          <ProtectedRoute><RidesPage /></ProtectedRoute>
        } />
        <Route path="/bookings" element={
          <ProtectedRoute><BookingsPage /></ProtectedRoute>
        } />

        {/* Admin only route */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App