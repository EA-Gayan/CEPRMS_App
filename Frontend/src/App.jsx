import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';

import LoginPage         from './pages/LoginPage';
import PatientDashboard  from './pages/patient/PatientDashboard';
import DoctorDashboard   from './pages/doctor/DoctorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications — top-right, dark themed */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d1529',
              color: '#f0f4ff',
              border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.9rem',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#0d1529' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1529' } },
          }}
        />

        <Routes>
          {/* Phase 1 — Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Phase 2 — Patient portal */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute role="patient">
                <PatientDashboard />
              </ProtectedRoute>
            }
          />

          {/* Phase 3 — Doctor portal */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Phase 4 — Admin (placeholder) */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role="admin">
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                  Admin Panel — Phase 4
                </div>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
