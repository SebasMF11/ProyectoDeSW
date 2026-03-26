const semesterService = require("../services/SemesterService");

exports.getSemester = async (req, res) => {
  try {
    const student_id = req.student.id;
    const semesters = await semesterService.getAll(student_id);
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo semestres" });
    console.log("que no mi rey", error);
  }
};

exports.createSemester = async (req, res) => {
  try {
    const { semestername, startdate, enddate, midtermweek } = req.body;
    const student_id = req.student.id;

    const end = new Date(enddate + "T00:00:00");
    const finalExam = new Date(end);
    finalExam.setDate(end.getDate() - 6);

    const midDate = new Date(midtermweek + "T00:00:00");
    const start = new Date(startdate + "T00:00:00");

    if (midDate < start || midDate > end) {
      return res.status(400).json({
        error:
          "La semana de parcial debe estar entre la fecha de inicio y fin del semestre",
      });
    }

    const finalexamweek = finalExam.toISOString().split("T")[0];

    const semester = await semesterService.create({
      semestername,
      startdate,
      enddate,
      midtermweek,
      finalexamweek,
      student_id,
    });

    res.status(201).json({
      message: "Semestre creado correctamente",
      semester: semester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.updateSemester = async (req, res) => {
  try {
    const { idsemester } = req.params;
    const { semestername, startdate, enddate, midtermweek } = req.body;
    const student_id = req.student.id;

    let finalexamweek;
    if (enddate) {
      const end = new Date(enddate);
      const finalExam = new Date(end);
      finalExam.setDate(end.getDate() - 6);
      finalexamweek = finalExam.toISOString().split("T")[0];
    }

    const semester = await semesterService.update(idsemester, student_id, {
      ...(semestername && { semestername }),
      ...(startdate && { startdate }),
      ...(enddate && { enddate }),
      ...(midtermweek && { midtermweek }),
      ...(finalexamweek && { finalexamweek }),
    });

    res.status(200).json({
      message: "Semestre actualizado correctamente",
      semester: semester,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
