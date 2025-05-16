const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const notes = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
