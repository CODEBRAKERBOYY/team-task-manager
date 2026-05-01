import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚀 TaskManager</h1>
        <h2 style={styles.subtitle}>Welcome Back!</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8'
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: { textAlign: 'center', color: '#1a1a2e', marginBottom: '5px' },
  subtitle: { textAlign: 'center', color: '#4a5568', marginBottom: '25px', fontSize: '18px' },
  error: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  field: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '6px', color: '#4a5568', fontSize: '14px', fontWeight: '600' },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4c51bf',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  footer: { textAlign: 'center', marginTop: '20px', color: '#4a5568', fontSize: '14px' },
  link: { color: '#4c51bf', fontWeight: '600' }
};

export default Login;