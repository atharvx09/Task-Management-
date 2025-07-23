router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { sortBy = 'dueDate', order = 'asc', limit = 10 } = req.query;

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const tasks = await Task.find({
      createdBy: userId,
      status: { $in: ['pending', 'in-progress'] }
    })
      .sort(sortOptions)
      .limit(parseInt(limit));

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
