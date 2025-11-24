const express = require('express');
require('dotenv');
const twilio = require("twilio");
const router = express.Router();
const Seed = require("../models/Seed");
const User = require("../models/User");

// Farmer adds Seeds
router.post("/add", async (req, res) => {
  const { farmerId, seedName, price, quantity, location, farmerMobile } =
    req.body;

  const farmer = await User.findById(farmerId);
  if (!farmer || farmer.role !== "farmer") {
    return res.status(403).json({ msg: "Only farmers can add Seeds" });
  }

  const seed = await Seed.create({
    farmerId,
    seedName,
    price: Number(price) || 0,
    quantity: Number(quantity) || 0,
    farmerLocation: location,
    farmerMobile,
  });

  res.json(seed);
});

// Farmer views their seeds
router.get("/byFarmer/:farmerId", async (req, res) => {
  const seeds = await Seed.find({ farmerId: req.params.farmerId });
  res.json(seeds);
});

router.post("/buy", async (req, res) => {
  const { farmerId, ownerId, seedId, notes, quantity } = req.body;
  const farmer = await User.findById(farmerId);
  const owner = await User.findById(ownerId);
  const seed = await Seed.findById(seedId);

  if (!farmer || farmer.role !== "farmer")
    return res.status(400).json({ msg: "Only farmers can request hires" });

//   const accountSid = "xxxxxxxx";
//   const authToken = "yyyyyy";
  const client = twilio(accountSid, authToken);

  async function createMessage() {
    try {
      const message = await client.messages.create({
        body:
          farmer.name +
          " { " +
          farmer.phone +
          " } " +
          "Requested to buy your" +
          seed.seedName +
          " seed about " +
          quantity +
          " kg" +
          ". Please call / message them back to discuss further about your availability.\n\nNotes: " +
          notes,
        from: "+13142480934",
        to: "+91" + owner.phone,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ msg: "Failed to send SMS notification", error: err.message });
    }
  }
  createMessage();
  res.json({ msg: "hire request sent" });
});

router.delete("/delete", async (req, res) => {
  try {
    seedId = req._id;
    await Seed.findOneAndDelete({ seedId });
    res.json({ message: "Seed deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// All Seeds (for demand overview)
router.get("/all", async (_req, res) => {
  const seeds = await Seed.find().populate("farmerId", "name");
  res.json(seeds);
});

// 🔹 Demand overview (fixes your 404)
router.get("/demand", async (_req, res) => {
  const agg = await Seed.aggregate([
    {
      $group: {
        _id: "$seedName",
        totalQuantity: { $sum: { $ifNull: ["$quantity", 0] } },
        farmers: { $addToSet: "$farmerId" },
      },
    },
    {
      $project: {
        _id: 0,
        seed: "$_id",
        totalQuantity: 1,
        totalFarmers: { $size: "$farmers" },
      },
    },
    { $sort: { totalFarmers: -1, seed: 1 } },
  ]);

  // Simple demand level heuristic; tweak as you like
  const withLevel = agg.map((x) => ({
    ...x,
    demandLevel:
      x.totalFarmers >= 5 ? "high" : x.totalFarmers >= 2 ? "medium" : "low",
  }));

  res.json(withLevel);
});

module.exports = router;
