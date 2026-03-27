const mongoose = require('mongoose');

const departSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });

const FunctionaryDepart = mongoose.model('FunctionaryDepart', departSchema, 'functionariesDeparts');

module.exports = FunctionaryDepart;
