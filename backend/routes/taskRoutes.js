const express = require('express');
const Task = require('../models/Tasks');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log('Decoded JWT:', decoded); // Debug log
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get tasks for the authenticated user (created or assigned)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user.userId },
        { assignedTo: req.user.userId },
      ],
    })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a task
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, dueDate, priority, status, assignedTo } = req.body;
  try {
    if (!title || !assignedTo) {
      return res.status(400).json({ message: 'Title and assignee are required' });
    }
    const task = new Task({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'Medium',
      status: status || 'Pending',
      createdBy: req.user.userId,
      assignedTo,
    });
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');
    res.status(201).json(populatedTask);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, dueDate, priority, status, assignedTo } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Allow update if user is creator or assignee
    if (task.createdBy.toString() !== req.user.userId && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this task' });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate ? new Date(dueDate) : task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.assignedTo = assignedTo || task.assignedTo;
    await task.save();
    const populatedTask = await Task.findById(task._id)
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name');

    res.status(200).json(populatedTask);
  } catch (error) {

    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    // Allow delete if user is creator
    if (task.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }
    await task.deleteOne();
    res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;