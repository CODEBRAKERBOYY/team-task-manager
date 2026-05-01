import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>
          🚀 TaskManager
        </Link>
      </div>
      <div style={styles.links}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/projects" style={styles.link}>Projects</Link>
        <Link to="/tasks" style={styles.link}>Tasks</Link>
        <span style={styles.user}>👤 {user?.name} ({user?.role})</span>
        <button onClick={handleLogout} style={styles.button}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    height: '60px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  brand: { fontSize: '20px', fontWeight: 'bold' },
  brandLink: { color: 'white', textDecoration: 'none' },
  links: { display: 'flex', alignItems: 'center', gap: '20px' },
  link: { color: 'white', textDecoration: 'none', fontSize: '14px' },
  user: { color: '#a0aec0', fontSize: '14px' },
  button: {
    backgroundColor: '#e53e3e',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default Navbar;