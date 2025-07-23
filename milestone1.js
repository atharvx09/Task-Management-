// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);


GET /api/tasks/next
Authorization: Bearer <token>



// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth'); // JWT middleware

// GET /api/tasks/next
router.get('/next', authMiddleware, async (req, res) => {
  try {
    const priorityOrder = { high: 1, medium: 2, low: 3 };

    const nextTask = await Task.find({
      createdBy: req.user.id,
      status: { $ne: 'completed' }
    })
      .sort([
        ['priority', 1],
        ['dueDate', 1],
        ['createdAt', 1]
      ])
      .limit(1);

    if (!nextTask.length) {
      return res.status(404).json({ message: 'No pending tasks found' });
    }

    res.json(nextTask[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
