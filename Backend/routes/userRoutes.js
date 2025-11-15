const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create simple users (Farmer / Transporter / Helper)
router.post('/register', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// Get all users (for selecting transporters)
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

module.exports = router;
