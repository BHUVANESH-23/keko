// backend/models/FarmerSelection.js
const mongoose = require('mongoose');

const FarmerSelectionSchema = new mongoose.Schema({
  farmerId: { type: String, required: true, unique: true }, // store user._id (string)
  selections: {
    type: Map,
    of: Number,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('FarmerSelection', FarmerSelectionSchema);
