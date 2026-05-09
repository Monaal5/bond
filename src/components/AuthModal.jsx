import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const ROLES = [
  { value: 'client', label: '👤 Investor / Client', desc: 'Browse and invest in bonds' },
  { value: 'manager', label: '📊 Manager', desc: 'Manage client portfolios' },
  { value: 'sub-manager', label: '🤝 Sub-Manager', desc: 'Assist portfolio management' },
];

export default function AuthModal({ mode, onClose, onSuccess }) {
  const [view, setView] = useState(mode || 'signup'); // 'signup' | 'login'
  const [role, setRole] = useState('client');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.name,
              mobile: form.mobile,
              role: role,
            }
          }
        });
        if (signUpError) throw signUpError;
        alert('Signup successful! Check your email for verification.');
        setView('login');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) throw signInError;
        
        // Success handled by auth state listener in App.jsx
        onSuccess(role);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        {/* Gradient border top */}
        <div className="auth-gradient-top" />

        {/* Close button */}
        <button className="auth-close-btn" onClick={onClose}>✕</button>

        {/* Logo */}
        <div className="auth-logo">
          <span className="lp-logo-icon">⬡</span>
          <span className="lp-logo-text">BondVault</span>
        </div>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${view === 'signup' ? 'active' : ''}`}
            onClick={() => { setView('signup'); setError(''); }}
          >
            Sign Up
          </button>
          <button
            className={`auth-tab ${view === 'login' ? 'active' : ''}`}
            onClick={() => { setView('login'); setError(''); }}
          >
            Log In
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {view === 'signup' && (
            <>
              <div className="auth-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="auth-field">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="+91 98765 43210"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role selector — visible on signup */}
          {view === 'signup' && (
            <div className="auth-field">
              <label>Access Role</label>
              <div className="auth-roles">
                {ROLES.map(r => (
                  <div
                    key={r.value}
                    className={`auth-role-card ${role === r.value ? 'selected' : ''}`}
                    onClick={() => setRole(r.value)}
                  >
                    <div className="auth-role-label">{r.label}</div>
                    <div className="auth-role-desc">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Login: quick role select */}
          {view === 'login' && (
            <div className="auth-field">
              <label>Login Context</label>
              <select
                className="auth-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
                <option value="admin">🔐 Admin Access</option>
              </select>
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : view === 'signup'
              ? 'Create Account & Access Platform'
              : 'Log In to Dashboard'}
          </button>
        </form>

        <p className="auth-switch-text">
          {view === 'signup'
            ? <>Already have an account? <span onClick={() => setView('login')}>Log In</span></>
            : <>New here? <span onClick={() => setView('signup')}>Create an account</span></>
          }
        </p>

        <p className="auth-disclaimer">
          By continuing, you agree to BondVault's Terms of Use and Privacy Policy.
          Investments are subject to market risk.
        </p>
      </div>
    </div>
  );
}
