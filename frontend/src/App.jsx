import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import VerificationPage from './pages/VerificationPage'
import AdminPage from './pages/AdminPage'
import AddVehiclePage from './pages/AddVehiclePage'

function AuthSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      // Decode token to get user info
      const base64 = token.split('.')[1];
      const decoded = JSON.parse(atob(base64));
      login(token, { 
        id: decoded.id, 
        is_admin: decoded.is_admin 
      });
      navigate('/dashboard');
    }
    else {
      navigate('/login');
    }
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '18px', color: '#093C5D' }}>
        Logging you in...
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/add-vehicle" element={<AddVehiclePage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App