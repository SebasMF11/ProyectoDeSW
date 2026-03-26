const assessmentService = require("../services/AssessmentService");

const validTypes = ["parcial", "quiz", "taller", "proyecto"];

exports.createAssessment = async (req, res) => {
  try {
    const { name, type, month, day, coursename } = req.body;
    const student_id = req.student.id;

    if (!name || !type || !month || !day || !coursename) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        error: `Tipo no válido. Usa: ${validTypes.join(", ")}`,
      });
    }

    const course = await assessmentService.getCourseByName(
      coursename,
      student_id,
    );
    if (!course) {
      return res
        .status(404)
        .json({ error: `No se encontró la asignatura "${coursename}"` });
    }

    const year = new Date().getFullYear();
    const duedate = new Date(
      `${year}-${String(month).padStart(2, "0")}-${String(Number(day)).padStart(2, "0")}`,
    );

    if (isNaN(duedate)) {
      return res.status(400).json({ error: "Fecha inválida" });
    }

    if (type.toLowerCase() === "parcial") {
      const semester = await assessmentService.getSemesterByCourse(
        course.idcourse,
      );
      if (!semester) {
        return res
          .status(404)
          .json({ error: "No se encontró el semestre de la asignatura" });
      }

      const midtermStart = new Date(semester.midtermweek + "T00:00:00");
      const midtermEnd = new Date(midtermStart);
      midtermEnd.setDate(midtermStart.getDate() + 6);

      if (duedate < midtermStart || duedate > midtermEnd) {
        return res.status(400).json({
          error: `Los parciales deben programarse entre el ${midtermStart.toLocaleDateString()} y el ${midtermEnd.toLocaleDateString()}`,
        });
      }
    }

    const assessment = await assessmentService.create({
      name,
      type: type.toLowerCase(),
      duedate: duedate.toISOString(),
      course_id: course.idcourse,
    });

    res.status(201).json({
      message: "Actividad creada correctamente",
      assessment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
