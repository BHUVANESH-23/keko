const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Farmer registers transporter vehicle
router.post('/registerVehicle', async (req, res) => {
  const { farmerId, vehicleId } = req.body;
  const farmer = await User.findById(farmerId);
  const vehicle = await Vehicle.findById(vehicleId).populate('transporterId');

  if (!farmer || farmer.role !== 'farmer')
    return res.status(400).json({ msg: 'Only farmers can register vehicles' });

  const registration = new Registration({
    farmerId,
    transporterId: vehicle.transporterId._id,
    vehicleId,
    status: 'registered',
  });
  await registration.save();

  res.json({ msg: 'Vehicle registered successfully', registration });
});

// Farmer can see all registered vehicles
router.get('/:farmerId', async (req, res) => {
  const regs = await Registration.find({ farmerId: req.params.farmerId })
    .populate('vehicleId transporterId', 'registrationNumber name');
  res.json(regs);
});

module.exports = router;
