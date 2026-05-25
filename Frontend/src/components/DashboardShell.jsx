import { ShieldCheck, LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './DashboardShell.css';

/**
 * Shared shell/navbar for all dashboard pages.
 * Phase 2 & 3 will fill in the sidebar content.
 */
export default function DashboardShell({ title, children }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const roleBadgeClass = {
    patient: 'badge-blue',
    doctor:  'badge-teal',
    admin:   'badge-red',
  }[user?.role] || 'badge-blue';

  return (
    <div className="shell">
      {/* ── Top navbar ─────────────────────────────────────────────── */}
      <header className="shell-navbar">
        <div className="shell-navbar__brand">
          <ShieldCheck size={22} />
          <span className="shell-navbar__name">CEPERM</span>
        </div>

        <div className="shell-navbar__center">
          <Activity size={14} className="shell-navbar__pulse" />
          <span>{title}</span>
        </div>

        <div className="shell-navbar__right">
          <span className={`badge ${roleBadgeClass}`}>{user?.role}</span>
          <span className="shell-navbar__user">{user?.full_name}</span>
          <button
            id="logout-btn"
            className="btn btn-secondary logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Page content ───────────────────────────────────────────── */}
      <main className="shell-main">{children}</main>
    </div>
  );
}
