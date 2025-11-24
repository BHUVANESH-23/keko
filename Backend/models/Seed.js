const mongoose = require("mongoose");
const { Schema } = mongoose;

const seedSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    seedName: { type: String, required: true, trim: true }, // <-- match routes
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    farmerLocation: { type: String, default: 0 },
    farmerMobile: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seed", seedSchema);
