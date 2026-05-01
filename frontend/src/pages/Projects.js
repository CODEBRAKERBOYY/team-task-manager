import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Projects = () => {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/projects`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.heading}>📁 Projects</h1>
          {user?.role === 'admin' && (
            <button style={styles.addButton} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Project'}
            </button>
          )}
        </div>

        {/* Create Project Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Project</h3>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleCreate}>
              <div style={styles.field}>
                <label style={styles.label}>Project Name</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Enter project name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                  placeholder="Enter project description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button style={styles.submitButton} type="submit">
                Create Project
              </button>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div style={styles.empty}>No projects yet! Create your first project.</div>
        ) : (
          <div style={styles.grid}>
            {projects.map(project => (
              <div key={project.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>📌 {project.name}</h3>
                  {user?.role === 'admin' && (
                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(project.id)}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p style={styles.cardDesc}>
                  {project.description || 'No description provided'}
                </p>
                <div style={styles.cardFooter}>
                  <span style={styles.owner}>👤 {project.owner_name}</span>
                  <span style={styles.date}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  content: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  heading: { color: '#1a1a2e', margin: 0 },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' },
  addButton: {
    backgroundColor: '#4c51bf', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
  },
  formCard: {
    backgroundColor: 'white', padding: '25px', borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '25px'
  },
  formTitle: { color: '#1a1a2e', marginTop: 0, marginBottom: '20px' },
  error: {
    backgroundColor: '#fed7d7', color: '#c53030',
    padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px'
  },
  field: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '6px', color: '#4a5568', fontSize: '14px', fontWeight: '600' },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box'
  },
  submitButton: {
    backgroundColor: '#48bb78', color: 'white', border: 'none',
    padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
  },
  empty: {
    backgroundColor: 'white', padding: '40px', borderRadius: '10px',
    textAlign: 'center', color: '#718096', fontSize: '16px'
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: {
    backgroundColor: 'white', padding: '20px', borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)', borderLeft: '4px solid #4c51bf'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cardTitle: { color: '#1a1a2e', margin: 0, fontSize: '16px' },
  deleteButton: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' },
  cardDesc: { color: '#718096', fontSize: '14px', marginBottom: '15px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  owner: { color: '#4a5568', fontSize: '12px' },
  date: { color: '#a0aec0', fontSize: '12px' }
};

export default Projects;