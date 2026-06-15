import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import axiosInstance from './utils/axiosInstance'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import HowItWorksPage from './pages/HowItWorksPage'
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
  const { login } = useAuth();

  useEffect(() => {
    axiosInstance.get('/users/profile')
      .then(res => {
        const user = res.data.user;
        if (user) {
          login(user);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      })
      .catch(() => {
        navigate('/login');
      });
  }, [login, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#EFF6FF' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: '#093C5D' }}>
        Logging you in...
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/how-it-works" element={<><Navbar /><HowItWorksPage /></>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />

        {/* Protected routes wrapped in DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/rides" element={<RidesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App