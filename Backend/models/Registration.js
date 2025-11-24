const mongoose = require("mongoose");
const { Schema } = mongoose;

const registrationSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transporterId: { type: String, required: true, trim: true },
    vehicleId: { type: String, required: true, trim: true },
    status: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("registration", registrationSchema);
