const mongoose = require('mongoose');
const BadgeSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  icon:        String,
  description: String,
  condition:   { type: String },
  rarity:      { type: String, enum: ['common','rare','epic','legendary'], default: 'common' },
  xpBonus:     { type: Number, default: 0 },
}, { timestamps: true });
module.exports = mongoose.model('Badge', BadgeSchema);
