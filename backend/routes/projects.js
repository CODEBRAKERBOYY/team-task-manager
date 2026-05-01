const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// GET all projects for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.owner_id = $1 
       OR p.id IN (SELECT project_id FROM project_members WHERE user_id = $1)
       ORDER BY p.created_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// GET single project
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// CREATE project (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create projects!' });
    }
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Project name is required!' });
    }
    const result = await pool.query(
      'INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, req.user.userId]
    );
    // Auto add creator as admin member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
      [result.rows[0].id, req.user.userId, 'admin']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// UPDATE project (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update projects!' });
    }
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = $1, description = $2 WHERE id = $3 AND owner_id = $4 RETURNING *',
      [name, description, req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found!' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// DELETE project (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete projects!' });
    }
    await pool.query(
      'DELETE FROM projects WHERE id = $1 AND owner_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ message: 'Project deleted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// ADD member to project (admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add members!' });
    }
    const { email, role } = req.body;
    // Find user by email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found!' });
    }
    // Add member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.params.id, user.rows[0].id, role || 'member']
    );
    res.json({ message: 'Member added successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

// GET project members
router.get('/:id/members', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, pm.role 
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error!' });
  }
});

module.exports = router;