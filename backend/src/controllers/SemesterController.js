const semesterService = require('../services/SemesterService');

exports.getSemesters = async (req, res) => {
  try {
    const semesters = await semesterService.getAll();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo semestres' });
    console.log('que no mi rey', error);
  }
};
