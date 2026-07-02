const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getAdminSummary,
} = require('../controllers/taskController');

// All task routes require a valid JWT
router.use(protect);

// Admin-only route — must come before /:id so 'admin' isn't read as an :id param
router.get('/admin/summary', requireRole('admin'), getAdminSummary);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;