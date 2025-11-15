// backend/models/MarketCrop.js
const mongoose = require('mongoose');

const MarketCropSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'wheat'
  name: { type: String, required: true },
  totalYield: { type: Number, required: true },        // capacity in units (tons)
  unit: { type: String, default: 'tons' },
  price: { type: Number, default: 0 },
  allocated: { type: Number, default: 0 },             // cached aggregated allocation (optional)
}, { timestamps: true });

module.exports = mongoose.model('MarketCrop', MarketCropSchema);
