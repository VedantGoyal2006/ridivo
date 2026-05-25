import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, accessToken, loading } = useAuth();

  // Still loading from localStorage
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", backgroundColor: "#0B1120",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color: "#38BDF8", fontFamily: "'DM Sans', sans-serif", fontSize: "18px" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Admin only route → redirect to dashboard
  if (adminOnly && !user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}