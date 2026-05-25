import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute – redirects unauthenticated users to /login.
 * Optionally enforces a specific `role`.
 */
export default function ProtectedRoute({ children, role }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Wrong role — send them to their own dashboard
    const dest = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/audit' };
    return <Navigate to={dest[user.role] || '/login'} replace />;
  }

  return children;
}
