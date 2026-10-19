// Creates admin user in DB
// Run from backend folder: node scripts/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function seed() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/vidyai",
  );
  const existing = await User.findOne({ email: "admin@vidyai.com" });
  if (existing) {
    existing.passwordHash = await bcrypt.hash("Admin@123", 12);
    existing.role = "admin";
    existing.isEmailVerified = true;
    existing.isActive = true;
    await existing.save();
    console.log("Admin account verified and refreshed.");
  } else {
    await User.create({
      name: "VidyAI Admin",
      email: "admin@vidyai.com",
      passwordHash: await bcrypt.hash("Admin@123", 12),
      role: "admin",
      language: "en",
      isEmailVerified: true,
      isActive: true,
    });
    console.log("Admin account created successfully!");
  }
  console.log("\n==========================================");
  console.log("VIDYAI ADMIN CREDENTIALS");
  console.log("Email:    admin@vidyai.com");
  console.log("Password: Admin@123");
  console.log("Role:     admin");
  console.log("URL:      https://vidyai-rural-learning.vercel.app/login");
  console.log("==========================================\n");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seeding error:", e.message);
  process.exit(1);
});
