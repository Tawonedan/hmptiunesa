const FunctionaryDepart = require('../models/FunctionaryDepart');

exports.getAllDeparts = async (req, res) => {
  try {
    const departs = await FunctionaryDepart.find().sort({ name: 1 });
    res.status(200).json(departs);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

exports.createDepart = async (req, res) => {
  try {
    const depart = await FunctionaryDepart.create(req.body);
    res.status(201).json(depart);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
