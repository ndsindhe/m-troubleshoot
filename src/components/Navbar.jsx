import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <span className="logo">📱</span>
        <span>Mobile KB</span>
      </div>
      <div className="navbar-actions">
        {isAdmin && (
          <>
            <span className="admin-badge">Admin</span>
            <button
              className={`btn btn-sm ${location.pathname === '/manage' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => navigate(location.pathname === '/manage' ? '/' : '/manage')}
            >
              {location.pathname === '/manage' ? '← Home' : '⚙ Manage'}
            </button>
          </>
        )}
        <span className="nav-user">{user?.email}</span>
        <button className="btn btn-sm btn-ghost" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
