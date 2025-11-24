

const express = require('express');
require('dotenv');
const router = express.Router();
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Registration = require('../models/Registration');

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

// Farmer adds Seeds
router.post("/add", async (req, res) => {
  const { farmerId, seedName, price, quantity, location, farmerMobile } =
    req.body;

  const farmer = await User.findById(farmerId);
  if (!farmer || farmer.role !== "farmer") {
    return res.status(403).json({ msg: "Only farmers can add Seeds" });
  }

  const seed = await Seed.create({
    farmerId,
    seedName,
    price: Number(price) || 0,
    quantity: Number(quantity) || 0,
    farmerLocation: location,
    farmerMobile,
  });

  res.json(seed);
});

module.exports = router;

