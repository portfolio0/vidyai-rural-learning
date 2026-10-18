const mongoose = require('mongoose');
const SchoolSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  district: String,
  state:    { type: String, default: 'Maharashtra' },
  pincode:  String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('School', SchoolSchema);
