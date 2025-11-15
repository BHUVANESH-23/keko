const mongoose = require('mongoose');
const { Schema } = mongoose;

const cropSchema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cropName: { type: String, required: true, trim: true }, // <-- match routes
  area: { type: Number, default: 0 },
  quantity: { type: Number, default: 0 },
  expectedYield: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
