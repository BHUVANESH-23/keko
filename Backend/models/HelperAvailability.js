const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HelperAvailabilitySchema = new Schema({
  helperId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  available: { type: Boolean, default: false },
  note: { type: String } // helper message / willingness text
}, { timestamps: true });

module.exports = mongoose.model('HelperAvailability', HelperAvailabilitySchema);
