const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vehicleSchema = new Schema({
  transporterId: { type: Schema.Types.ObjectId, ref: 'User' },
  registrationNumber: String,
  type: String,
  capacity: Number
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
