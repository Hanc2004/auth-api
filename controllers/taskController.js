const pool = require('../config/db');

// GET /api/tasks
// Admin: sees every task (with the owner's name/email attached)
// User: sees only their own tasks
const getTasks = async (req, res) => {
  try {
    let result;

    if (req.user.role === 'admin') {
      result = await pool.query(
        `SELECT tasks.*, users.name AS owner_name, users.email AS owner_email
         FROM tasks
         JOIN users ON tasks.user_id = users.id
         ORDER BY tasks.created_at DESC`
      );
    } else {
      result = await pool.query(
        'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
    }

    res.json({ tasks: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership check: only the owner or an admin may view it
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: not your task' });
    }

    res.json({ task });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tasks
// Every logged-in user can create a task for themselves
const createTask = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description || null, status || 'pending', req.user.id]
    );

    res.status(201).json({ message: 'Task created', task: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = existing.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership check: only the owner or an admin may edit it
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: not your task' });
    }

    const result = await pool.query(
      `UPDATE tasks
       SET title = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4 RETURNING *`,
      [
        title || task.title,
        description !== undefined ? description : task.description,
        status || task.status,
        id,
      ]
    );

    res.json({ message: 'Task updated', task: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    const task = existing.rows[0];

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ownership check: only the owner or an admin may delete it
    if (req.user.role !== 'admin' && task.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: not your task' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/tasks/admin/summary
// Admin-only: task counts grouped by user (uses requireRole middleware, not ownership logic)
const getAdminSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT users.id, users.name, users.email,
              COUNT(tasks.id) AS total_tasks,
              COUNT(tasks.id) FILTER (WHERE tasks.status = 'completed') AS completed_tasks
       FROM users
       LEFT JOIN tasks ON tasks.user_id = users.id
       GROUP BY users.id
       ORDER BY total_tasks DESC`
    );

    res.json({ summary: result.rows });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getAdminSummary };