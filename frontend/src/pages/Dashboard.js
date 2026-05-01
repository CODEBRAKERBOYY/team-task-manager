import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, tasksRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/tasks/dashboard`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/tasks`, { headers })
      ]);
      setStats(statsRes.data);
      setTasks(tasksRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === 'todo') return '#e2e8f0';
    if (status === 'in_progress') return '#bee3f8';
    if (status === 'done') return '#c6f6d5';
  };

  const getPriorityColor = (priority) => {
    if (priority === 'high') return '#fed7d7';
    if (priority === 'medium') return '#fefcbf';
    if (priority === 'low') return '#c6f6d5';
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h1 style={styles.heading}>👋 Welcome, {user?.name}!</h1>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderTop: '4px solid #4c51bf' }}>
            <h3 style={styles.statNumber}>{stats.total}</h3>
            <p style={styles.statLabel}>Total Tasks</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #ed8936' }}>
            <h3 style={styles.statNumber}>{stats.todo}</h3>
            <p style={styles.statLabel}>To Do</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #4299e1' }}>
            <h3 style={styles.statNumber}>{stats.in_progress}</h3>
            <p style={styles.statLabel}>In Progress</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #48bb78' }}>
            <h3 style={styles.statNumber}>{stats.done}</h3>
            <p style={styles.statLabel}>Done</p>
          </div>
          <div style={{ ...styles.statCard, borderTop: '4px solid #e53e3e' }}>
            <h3 style={styles.statNumber}>{stats.overdue}</h3>
            <p style={styles.statLabel}>Overdue</p>
          </div>
        </div>

        {/* Recent Tasks */}
        <h2 style={styles.sectionTitle}>Recent Tasks</h2>
        {tasks.length === 0 ? (
          <div style={styles.empty}>No tasks yet! Ask your admin to assign tasks.</div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={styles.tableRow}>
                    <td style={styles.td}>{task.title}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: getStatusColor(task.status) }}>
                        {task.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: getPriorityColor(task.priority) }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0f4f8' },
  content: { padding: '30px', maxWidth: '1200px', margin: '0 auto' },
  heading: { color: '#1a1a2e', marginBottom: '25px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '40px' },
  statCard: {
    backgroundColor: 'white', padding: '20px', borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center'
  },
  statNumber: { fontSize: '36px', fontWeight: 'bold', color: '#1a1a2e', margin: '0 0 5px 0' },
  statLabel: { color: '#718096', fontSize: '14px', margin: 0 },
  sectionTitle: { color: '#1a1a2e', marginBottom: '15px' },
  empty: { backgroundColor: 'white', padding: '30px', borderRadius: '10px', textAlign: 'center', color: '#718096' },
  tableWrapper: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { backgroundColor: '#f7fafc' },
  th: { padding: '12px 16px', textAlign: 'left', fontSize: '14px', color: '#4a5568', fontWeight: '600', borderBottom: '1px solid #e2e8f0' },
  tableRow: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '12px 16px', fontSize: '14px', color: '#2d3748' },
  badge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }
};

export default Dashboard;