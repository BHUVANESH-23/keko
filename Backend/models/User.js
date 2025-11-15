// backend/models/User.js
const mongoose = require('mongoose');

const ROLES = ['farmer', 'transporter', 'customer', 'helper'];

function normalizePhone(p) {
  if (typeof p !== 'string') p = String(p || '');
  // keep digits only; adjust if you want to keep '+'.
  return p.replace(/\D/g, '');
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Store as digits-only to avoid duplicates with spaces/dashes
      set: normalizePhone,
    },
    role: { type: String, enum: ROLES, required: true },
  },
  { timestamps: true }
);

// Optional: ensure normalized before save if phone set via update operators.
userSchema.pre('save', function (next) {
  if (this.isModified('phone')) {
    this.phone = normalizePhone(this.phone);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
module.exports.normalizePhone = normalizePhone;
