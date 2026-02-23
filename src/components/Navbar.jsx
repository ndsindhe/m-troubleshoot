import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || (document.documentElement.classList.contains('light-theme') ? 'light' : 'dark'); } catch { return 'dark'; }
  });

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Apply theme class to document and persist
  useEffect(() => {
    try {
      if (theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
      }
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }, [theme]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo">📱</span>
        <span>Shree Datt</span>
      </div>
      <div className="navbar-actions">
        {isAdmin && (
          <>
            <span className="admin-badge">Admin</span>
            <button
              className={`btn btn-sm manage-btn ${location.pathname === '/manage' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => navigate(location.pathname === '/manage' ? '/' : '/manage')}
            >
              {location.pathname === '/manage' ? '← Home' : '⚙ Manage'}
            </button>
          </>
        )}
        <span className="nav-user">{user?.email}</span>
        <button className="btn btn-sm btn-ghost logout-btn" onClick={handleLogout}>Logout</button>
        <button
          className="btn btn-sm btn-ghost theme-toggle"
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Mobile hamburger toggle - visible via CSS on small screens */}
        <button className="mobile-toggle btn btn-ghost" onClick={() => setOpen(true)} aria-label="Open menu">☰</button>
      </div>

      {open && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <div className="mobile-menu-inner">
            <div className="mobile-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="logo">📱</span>
                <strong>Shree Datt</strong>
              </div>
              <button className="btn btn-ghost" onClick={() => setOpen(false)} aria-label="Close menu">✕</button>
            </div>
            <div className="mobile-menu-body">
              <button className="btn btn-block btn-secondary" onClick={() => { setOpen(false); navigate('/'); }}>Home</button>
              {isAdmin && (
                <button className="btn btn-block btn-secondary" onClick={() => { setOpen(false); navigate('/manage'); }}>Manage</button>
              )}
              <button
                className="btn btn-block btn-ghost"
                onClick={() => { setOpen(false); setTheme(prev => prev === 'light' ? 'dark' : 'light'); }}
              >
                {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user?.email}</div>
              <button className="btn btn-block btn-ghost" onClick={() => { setOpen(false); handleLogout(); }}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
