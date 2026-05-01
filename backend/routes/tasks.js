const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET all tasks for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, p.name as project_name, u.name as assigned_to_name
       FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.assigned_to = $1 OR t.created_by = $1
       ORDER BY t.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// GET all tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, c.name as created_by_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users c ON t.created_by = c.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// GET dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const total = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1',
      [req.user.userId]
    );
    const todo = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = $2',
      [req.user.userId, 'todo']
    );
    const inProgress = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = $2',
      [req.user.userId, 'in_progress']
    );
    const done = await pool.query(
      'SELECT COUNT(*) FROM tasks WHERE assigned_to = $1 AND status = $2',
      [req.user.userId, 'done']
    );
    const overdue = await pool.query(
      `SELECT COUNT(*) FROM tasks 
       WHERE assigned_to = $1 
       AND due_date < CURRENT_DATE 
       AND status != 'done'`,
      [req.user.userId]
    );
    res.json({
      total: parseInt(total.rows[0].count),
      todo: parseInt(todo.rows[0].count),
      in_progress: parseInt(inProgress.rows[0].count),
      done: parseInt(done.rows[0].count),
      overdue: parseInt(overdue.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// GET single task
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name as assigned_to_name, p.name as project_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// CREATE task (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create tasks!' });
    }
    const { title, description, status, priority, due_date, project_id, assigned_to } = req.body;
    if (!title || !project_id) {
      return res.status(400).json({ message: 'Title and project are required!' });
    }
    const result = await pool.query(
      `INSERT INTO tasks 
       (title, description, status, priority, due_date, project_id, assigned_to, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, status || 'todo', priority || 'medium',
       due_date || null, project_id, assigned_to || null, req.user.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// UPDATE task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, status, priority, due_date, assigned_to } = req.body;
    // Members can only update status
    if (req.user.role === 'member') {
      const result = await pool.query(
        'UPDATE tasks SET status = $1 WHERE id = $2 AND assigned_to = $3 RETURNING *',
        [status, req.params.id, req.user.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Task not found!' });
      }
      return res.json(result.rows[0]);
    }
    // Admin can update everything
    const result = await pool.query(
      `UPDATE tasks SET 
       title = $1, description = $2, status = $3, 
       priority = $4, due_date = $5, assigned_to = $6
       WHERE id = $7 RETURNING *`,
      [title, description, status, priority, due_date || null, assigned_to, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// DELETE task (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks!' });
    }
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ message: 'Task deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;