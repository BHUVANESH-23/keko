const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const User = require('../models/User');

// Farmer adds crop
router.post('/add', async (req, res) => {
  const { farmerId, cropName, area, quantity, expectedYield } = req.body;

  const farmer = await User.findById(farmerId);
  if (!farmer || farmer.role !== 'farmer') {
    return res.status(403).json({ msg: 'Only farmers can add crops' });
  }

  const crop = await Crop.create({
    farmerId,
    cropName,
    area: Number(area) || 0,
    quantity: Number(quantity) || 0,
    expectedYield: Number(expectedYield) || 0,
  });

  res.json(crop);
});

// Farmer views their crops
router.get('/byFarmer/:farmerId', async (req, res) => {
  const crops = await Crop.find({ farmerId: req.params.farmerId });
  res.json(crops);
});

// All crops (for demand overview)
router.get('/all', async (_req, res) => {
  const crops = await Crop.find().populate('farmerId', 'name');
  res.json(crops);
});

// 🔹 Demand overview (fixes your 404)
router.get('/demand', async (_req, res) => {
  const agg = await Crop.aggregate([
    {
      $group: {
        _id: '$cropName',
        totalQuantity: { $sum: { $ifNull: ['$quantity', 0] } },
        farmers: { $addToSet: '$farmerId' },
      }
    },
    {
      $project: {
        _id: 0,
        crop: '$_id',
        totalQuantity: 1,
        totalFarmers: { $size: '$farmers' }
      }
    },
    { $sort: { totalFarmers: -1, crop: 1 } }
  ]);

  // Simple demand level heuristic; tweak as you like
  const withLevel = agg.map(x => ({
    ...x,
    demandLevel: x.totalFarmers >= 5 ? 'high' : x.totalFarmers >= 2 ? 'medium' : 'low'
  }));

  res.json(withLevel);
});

module.exports = router;
