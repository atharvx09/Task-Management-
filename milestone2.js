const allowedTransitions = {
  pending: ['in-progress', 'completed'],
  'in-progress': ['completed'],
  completed: [] // no transition allowed
};

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check if user owns this task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Prevent regression
    if (status && status !== task.status) {
      const allowed = allowedTransitions[task.status];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from '${task.status}' to '${status}'`
        });
      }
    }

    // Update allowed fields
    task.status = status || task.status;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.dueDate = req.body.dueDate || task.dueDate;
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
