// Backend/seed/seedMarketCrops.js
const mongoose = require("mongoose");
const MarketCrop = require("../models/MarketCrop");

const seedData = [
  { key: "wheat", name: "Wheat", totalYield: 1000, price: 5000, unit: "tons" },
  { key: "rice", name: "Rice", totalYield: 1000, price: 6000, unit: "tons" },
  { key: "corn", name: "Corn", totalYield: 800, price: 4500, unit: "tons" },
  { key: "sugarcane", name: "Sugarcane", totalYield: 1200, price: 3000, unit: "tons" },
  { key: "cotton", name: "Cotton", totalYield: 500, price: 8000, unit: "tons" },
];

async function seed() {
  try {
    await mongoose.connect("mongodb://localhost:27017/agriapp");
    console.log("Connected to MongoDB");

    await MarketCrop.deleteMany({});
    console.log("Old crop data cleared");

    await MarketCrop.insertMany(seedData);
    console.log("Seed data inserted successfully");

    process.exit();
  } catch (err) {
    console.error("Error seeding:", err);
    process.exit(1);
  }
}

seed();
