const semesterService = require('../services/SemesterService');

exports.getSemester = async (req, res) => {
  try {
    const semesters = await semesterService.getAll();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo semestres' });
    console.log('que no mi rey', error);

  }
};

exports.createSemester = async (req, res) => {

  try {

    const { semestername, startdate, enddate, midtermweek, student_id } = req.body;

    const end = new Date(enddate);
    const finalExam = new Date(end);
    finalExam.setDate(end.getDate() - 6);

    const finalexamweek = finalExam.toISOString().split("T")[0];

    const semester = await semesterService.create({
      semestername,
      startdate,
      enddate,
      midtermweek,
      finalexamweek,
      student_id
    });

    res.status(201).json({
  message: "Semestre creado correctamente",
  semester: semester
});


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }

};

