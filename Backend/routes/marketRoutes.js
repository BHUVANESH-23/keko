// backend/routes/marketRoutes.js
const express = require('express');
const router = express.Router();
const MarketCrop = require('../models/MarketCrop');
const FarmerSelection = require('../models/FarmerSelection');
const User = require('../models/User'); // optional: to validate farmer role

// Recompute aggregated totals from FarmerSelection documents
async function recomputeTotals() {
  const selections = await FarmerSelection.find({});
  const totals = {}; // key -> sum
  selections.forEach(doc => {
    for (const [k, v] of doc.selections.entries()) {
      totals[k] = (totals[k] || 0) + (Number(v) || 0);
    }
  });
  // update cached allocated on MarketCrop (optional)
  const crops = await MarketCrop.find({});
  const updates = crops.map(crop => {
    const newAlloc = totals[crop.key] || 0;
    if (crop.allocated !== newAlloc) {
      crop.allocated = newAlloc;
      return crop.save();
    }
    return Promise.resolve();
  });
  await Promise.all(updates);
  return totals;
}

/**
 * GET /api/market
 * Returns market crops with { key, name, totalYield, allocated, remaining, unit, price }
 */
router.get('/', async (req, res) => {
  try {
    const crops = await MarketCrop.find({}).lean();
    const totals = await recomputeTotals();
    const out = crops.map(c => ({
      key: c.key,
      name: c.name,
      totalYield: c.totalYield,
      allocated: totals[c.key] || 0,
      remaining: Math.max(0, c.totalYield - (totals[c.key] || 0)),
      unit: c.unit,
      price: c.price,
    }));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load market' });
  }
});

/**
 * POST /api/market/market-selections
 * Body: { selections: { [cropKey]: number, ... } }
 * Uses req.user._id if attachUser middleware sets it; otherwise expects body.farmerId.
 *
 * This endpoint upserts the farmer's selection while ensuring global totals do not exceed each crop's totalYield.
 */
router.post('/market-selections', async (req, res) => {
  try {
    const farmerId = (req.user && req.user._id) || req.body?.farmerId;
    if (!farmerId) return res.status(400).json({ message: 'farmerId required (or login)' });

    // Optional: validate farmer role
    if (req.user && req.user.role && req.user.role !== 'farmer') {
      return res.status(403).json({ message: 'Only farmers may submit market selections' });
    } else if (!req.user) {
      // if you want stronger validation, fetch user from DB:
      // const u = await User.findById(farmerId);
      // if (!u || u.role !== 'farmer') return res.status(403).json({ message: 'Only farmers may submit' });
    }

    const payload = req.body?.selections || {};
    // normalize numbers
    const newSelections = {};
    for (const k of Object.keys(payload)) {
      const n = Number(payload[k]) || 0;
      if (n < 0) return res.status(400).json({ message: `Invalid selection for ${k}` });
      newSelections[k] = n;
    }

    // load market crops
    const crops = await MarketCrop.find({}).lean();
    const cropMap = {};
    crops.forEach(c => (cropMap[c.key] = c));

    // compute current totals
    const allSelections = await FarmerSelection.find({});
    const totals = {};
    allSelections.forEach(s => {
      for (const [k, v] of s.selections.entries()) {
        totals[k] = (totals[k] || 0) + (Number(v) || 0);
      }
    });

    // subtract existing farmer allocations (we will replace them)
    const existing = await FarmerSelection.findOne({ farmerId });
    if (existing) {
      for (const [k, v] of existing.selections.entries()) {
        totals[k] = (totals[k] || 0) - (Number(v) || 0);
      }
    }

    // Validate: ensure new totals won't exceed crop.totalYield
    const errors = [];
    for (const key of Object.keys(newSelections)) {
      const crop = cropMap[key];
      if (!crop) {
        errors.push(`Unknown crop: ${key}`);
        continue;
      }
      const candidate = (totals[key] || 0) + Number(newSelections[key] || 0);
      if (candidate > crop.totalYield) {
        errors.push(`${key}: requested total ${candidate} > capacity ${crop.totalYield}`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: 'Allocation would exceed totals', details: errors });
    }

    // Upsert farmer selection
    await FarmerSelection.updateOne(
      { farmerId },
      { farmerId, selections: newSelections },
      { upsert: true, setDefaultsOnInsert: true }
    );

    // recompute and return updated market state
    const totalsAfter = await recomputeTotals();
    const response = crops.map(c => ({
      key: c.key,
      name: c.name,
      totalYield: c.totalYield,
      allocated: totalsAfter[c.key] || 0,
      remaining: Math.max(0, c.totalYield - (totalsAfter[c.key] || 0)),
      unit: c.unit,
      price: c.price,
    }));

    res.json({ message: 'Selections saved', market: response });
  } catch (err) {
    console.error('market selection error', err);
    res.status(500).json({ message: 'Failed to save selections' });
  }
});

// Also add POST /selections as an alias (optional)
router.post('/selections', async (req, res, next) => {
  // delegate to /market-selections
  return router.handle(req, res, next);
});

module.exports = router;
