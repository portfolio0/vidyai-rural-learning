// Creates admin user in DB
// Run from backend folder: node scripts/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function seed() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/vidyai",
  );
  const existing = await User.findOne({ email: "admin@vidyai.com" });
  if (existing) {
    console.log("Admin already exists!");
  } else {
    await User.create({
      name: "VidyAI Admin",
      email: "admin@vidyai.com",
      passwordHash: "Admin@123",
      role: "admin",
      language: "en",
    });
    console.log("Admin created!");
  }
  console.log("Login: admin@vidyai.com / Admin@123");
  process.exit(0);
}
seed().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
