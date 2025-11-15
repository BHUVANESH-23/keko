const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HireSchema = new Schema({
  farmerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  helperId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cropId: { type: Schema.Types.ObjectId, ref: 'Crop' }, // optional, which crop the helper is hired for
  status: { type: String, enum: ['requested','accepted','rejected','completed'], default: 'requested' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Hire', HireSchema);
