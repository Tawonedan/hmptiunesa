const LecturerExpertise = require('../models/LecturerExpertise');

exports.getAllExpertise = async (req, res) => {
  try {
    const expertises = await LecturerExpertise.find();
    res.status(200).json(expertises);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.createExpertise = async (req, res) => {
  try {
    const expertise = await LecturerExpertise.create(req.body);
    res.status(201).json(expertise);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
