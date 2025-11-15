const express = require('express');
const router = express.Router();
const HelperAvailability = require('../models/HelperAvailability');
const User = require('../models/User');

// Helper sets/updates their availability
router.post('/setAvailability', async (req, res) => {
  try {
    const { helperId, available, note } = req.body;
    const user = await User.findById(helperId);
    if (!user || user.role !== 'helper') return res.status(400).json({ msg: 'Only helpers can set availability' });

    const existing = await HelperAvailability.findOne({ helperId });
    if (existing) {
      existing.available = available;
      existing.note = note;
      await existing.save();
      return res.json(existing);
    }

    const ha = new HelperAvailability({ helperId, available, note });
    await ha.save();
    res.json(ha);
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
});

// Get all helpers availability (farmers use this to find helpers)
router.get('/all', async (req, res) => {
  const list = await HelperAvailability.find().populate('helperId', 'name email');
  res.json(list);
});

// Get single helper availability by helperId
router.get('/:helperId', async (req, res) => {
  const single = await HelperAvailability.findOne({ helperId: req.params.helperId });
  res.json(single);
});

module.exports = router;
