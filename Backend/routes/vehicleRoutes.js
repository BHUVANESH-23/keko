const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Add vehicle (Transporter only)
router.post('/add', async (req, res) => {
  const { transporterId, registrationNumber, type, capacity } = req.body;
  const transporter = await User.findById(transporterId);
  if (transporter.role !== 'transporter') return res.status(403).json({ msg: 'Only transporters can add vehicles' });

  const vehicle = new Vehicle({ transporterId, registrationNumber, type, capacity });
  await vehicle.save();
  res.json(vehicle);
});

// Get all vehicles (for farmer selection)
router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find().populate('transporterId', 'name');
  res.json(vehicles);
});

module.exports = router;
