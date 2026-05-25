import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ShieldCheck, Eye, EyeOff, Mail, Lock, User, Hash,
  Stethoscope, ChevronRight, Activity,
} from 'lucide-react';

import { authLogin, authRegister } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

// ─── Role tab ─────────────────────────────────────────────────────────────
function RoleTab({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      id={id}
      className={`role-tab ${active ? 'role-tab--active' : ''}`}
      onClick={onClick}
      type="button"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ─── Input field with icon ────────────────────────────────────────────────
function IconInput({ id, icon: Icon, type = 'text', placeholder, value, onChange, rightSlot }) {
  return (
    <div className="icon-input-wrap">
      <Icon className="icon-input__icon" size={16} />
      <input
        id={id}
        className="form-input icon-input__field"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      {rightSlot && <div className="icon-input__right">{rightSlot}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function LoginPage() {
  const navigate     = useNavigate();
  const { login }    = useAuth();

  // ── UI state ─────────────────────────────────────────────────────────
  const [mode, setMode]       = useState('login');    // 'login' | 'register'
  const [role, setRole]       = useState('patient');  // 'patient' | 'doctor'
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Form fields ───────────────────────────────────────────────────────
  const [form, setForm] = useState({
    email: '', password: '', full_name: '',
    national_health_id: '', specialization: '',
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await authLogin(form.email, form.password);
        login(res.data.user);
        toast.success(`Welcome back, ${res.data.user.full_name}!`);
        // Redirect based on role
        const dest = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/audit' };
        navigate(dest[res.data.user.role] || '/');
      } else {
        const payload = { email: form.email, password: form.password, role, full_name: form.full_name };
        if (role === 'patient') payload.national_health_id = form.national_health_id;
        if (role === 'doctor')  payload.specialization     = form.specialization;

        const res = await authRegister(payload);
        toast.success('Account created! Please log in.');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="login-page">
      {/* ── Left panel: branding ──────────────────────────────────────── */}
      <div className="login-brand">
        <div className="login-brand__inner">
          <div className="brand-logo">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <h1 className="brand-title">CEPERM</h1>
          <p className="brand-subtitle">
            Consent-Enabled Patient Electronic Records Management
          </p>

          <div className="brand-features">
            {[
              { icon: ShieldCheck,   text: 'AES-256 Encrypted Records' },
              { icon: Activity,      text: 'ABAC Consent Control' },
              { icon: Stethoscope,   text: 'Role-Based Doctor Access' },
            ].map(({ icon: Icon, text }) => (
              <div className="brand-feature" key={text}>
                <div className="brand-feature__dot"><Icon size={14} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Decorative grid lines */}
          <div className="brand-deco" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="brand-deco__line" style={{ '--i': i }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: form ─────────────────────────────────────────── */}
      <div className="login-form-panel">
        <div className="glass-card login-card">

          {/* Mode toggle */}
          <div className="mode-tabs">
            <button
              id="tab-login"
              className={`mode-tab ${mode === 'login' ? 'mode-tab--active' : ''}`}
              onClick={() => setMode('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              id="tab-register"
              className={`mode-tab ${mode === 'register' ? 'mode-tab--active' : ''}`}
              onClick={() => setMode('register')}
              type="button"
            >
              Create Account
            </button>
            <div
              className="mode-tab__indicator"
              style={{ transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)' }}
            />
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>

            {/* ── Register-only: role selector ─────────────────────── */}
            {mode === 'register' && (
              <div className="role-tabs">
                <RoleTab id="role-patient" label="Patient" icon={User}        active={role === 'patient'} onClick={() => setRole('patient')} />
                <RoleTab id="role-doctor"  label="Doctor"  icon={Stethoscope} active={role === 'doctor'}  onClick={() => setRole('doctor')}  />
              </div>
            )}

            {/* ── Register-only: full name ─────────────────────────── */}
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="full-name">Full Name</label>
                <IconInput
                  id="full-name"
                  icon={User}
                  placeholder="Dr. Jane Smith"
                  value={form.full_name}
                  onChange={set('full_name')}
                />
              </div>
            )}

            {/* ── Email ────────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <IconInput
                id="email"
                icon={Mail}
                type="email"
                placeholder="you@hospital.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            {/* ── Password ─────────────────────────────────────────── */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <IconInput
                id="password"
                icon={Lock}
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={form.password}
                onChange={set('password')}
                rightSlot={
                  <button
                    id="toggle-password"
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((p) => !p)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />
            </div>

            {/* ── Register-only: patient NHI ───────────────────────── */}
            {mode === 'register' && role === 'patient' && (
              <div className="form-group">
                <label className="form-label" htmlFor="nhi">National Health ID</label>
                <IconInput
                  id="nhi"
                  icon={Hash}
                  placeholder="NHI-00123"
                  value={form.national_health_id}
                  onChange={set('national_health_id')}
                />
              </div>
            )}

            {/* ── Register-only: doctor specialization ─────────────── */}
            {mode === 'register' && role === 'doctor' && (
              <div className="form-group">
                <label className="form-label" htmlFor="specialization">Specialization</label>
                <IconInput
                  id="specialization"
                  icon={Stethoscope}
                  placeholder="Cardiology, Neurology…"
                  value={form.specialization}
                  onChange={set('specialization')}
                />
              </div>
            )}

            {/* ── Submit button ─────────────────────────────────────── */}
            <button
              id="submit-btn"
              type="submit"
              className="btn btn-primary btn-full btn-lg submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In Securely' : 'Create Account'}
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="login-footer">
            {mode === 'login'
              ? <>New to CEPERM? <button className="link-btn" onClick={() => setMode('register')}>Create an account</button></>
              : <>Already have an account? <button className="link-btn" onClick={() => setMode('login')}>Sign in</button></>
            }
          </p>
        </div>
      </div>
    </div>
  );
}
