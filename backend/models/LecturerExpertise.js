const mongoose = require('mongoose');

const expertiseSchema = new mongoose.Schema({
  id: { type: String },
  label: { type: String, required: true },
  name: { type: String }
}, { timestamps: true });

// Setting the specific collection name to "lecturersExpertise" as requested
const LecturerExpertise = mongoose.model('LecturerExpertise', expertiseSchema, 'lecturersExpertise');

module.exports = LecturerExpertise;
