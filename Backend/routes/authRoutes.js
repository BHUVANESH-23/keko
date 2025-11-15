// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ROLES, normalizePhone } = require('../models/User');

// POST /api/auth/register
// body: { name, phone, role }
router.post('/register', async (req, res) => {
  console.log(req.body);
  
  try {
    const { name, phone, role } = req.body;
    if (!name || !phone || !role) {
      return res.status(400).json({ message: 'name, phone and role are required' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    let user = await User.findOne({ phone: normalized });

    if (!user) {
      user = await User.create({ name, phone: normalized, role });
    } else {
      // ✅ Ensure “designated user type” on login
      const updates = {};
      if (user.role !== role) updates.role = role;
      if (name && name !== user.name) updates.name = name;
      if (Object.keys(updates).length) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        user = await User.findById(user._id);
      }
    }

    return res.json(user);
  } catch (err) {

    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me  -> uses x-user-id header
router.get('/me', async (req, res) => {
  const id = req.header('x-user-id');
  if (!id) return res.status(200).json(null);
  const user = await User.findById(id);
  return res.json(user || null);
});

module.exports = router;
