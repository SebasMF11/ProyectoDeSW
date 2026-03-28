const assessmentService = require("../services/AssessmentService");

const validTypes = [
  "parcial",
  "quiz",
  "taller",
  "proyecto",
  "exposicion",
  "laboratorio",
];
const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

exports.createAssessment = async (req, res) => {
  try {
    const { name, type, month, day, coursename, percentage } = req.body;
    const student_id = req.student.id;

    if (!name || !type || !month || !day || !coursename || !percentage) {
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
    const duedateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const duedateObj = new Date(duedateStr + "T00:00:00");

    if (isNaN(duedateObj)) {
      return res.status(400).json({ error: "Fecha inválida" });
    }

    /*
    //validacion MUY diabolica para validar los dias de clase
    const duedayOfWeek = daysOfWeek[duedateObj.getDay()];
    const courseDays = await assessmentService.getDaysByCourse(course.idcourse);

    if (!courseDays || courseDays.length === 0) {
      return res
        .status(400)
        .json({ error: "Este curso no tiene días de clase registrados" });
    }

    const hasClass = courseDays.some(
      (d) => d.dayofweek.toLowerCase() === duedayOfWeek,
    );
    if (!hasClass) {
      const validDays = courseDays.map((d) => d.dayofweek).join(", ");
      return res.status(400).json({
        error: `No tienes clase de "${coursename}" ese día. Los días de clase son: ${validDays}`,
      });
    }
    */

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

      if (duedateObj < midtermStart || duedateObj > midtermEnd) {
        return res.status(400).json({
          error: `Los parciales deben programarse entre el ${midtermStart.toLocaleDateString()} y el ${midtermEnd.toLocaleDateString()}`,
        });
      }
    }

    // que una actividad no supere el 25%
    if (percentage > 25) {
      return res.status(400).json({
        error: "El porcentaje de una actividad no puede superar el 25%",
      });
    }

    // que la suma no pase del 100%
    const existingAssessments = await assessmentService.getTotalPercentage(
      course.idcourse,
    );
    if (existingAssessments) {
      const totalPercentage = existingAssessments.reduce(
        (acc, a) => acc + a.percentage,
        0,
      );
      if (totalPercentage + percentage > 100) {
        return res.status(400).json({
          error: `La suma de porcentajes superaría el 100%. Porcentaje disponible: ${100 - totalPercentage}%`,
        });
      }
    }

    const conflict = await assessmentService.checkAssessmentConflict(
      course.idcourse,
      duedateStr,
    );
    if (conflict && conflict.length > 0) {
      return res.status(400).json({
        error: `Ya tienes una actividad de "${coursename}" agendada para ese día`,
      });
    }

    const assessment = await assessmentService.create({
      name,
      type: type.toLowerCase(),
      duedate: duedateStr,
      course_id: course.idcourse,
      percentage,
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

exports.getAssessments = async (req, res) => {
  try {
    const student_id = req.student.id;
    const assessments = await assessmentService.getAll(student_id);
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const student_id = req.student.id;
    const assessments = await assessmentService.getByCourse(
      course_id,
      student_id,
    );
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getAssessmentsBySemester = async (req, res) => {
  try {
    const { semester_id } = req.params;
    const student_id = req.student.id;
    const assessments = await assessmentService.getBySemester(
      semester_id,
      student_id,
    );
    res.status(200).json({ assessments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.updateAssessment = async (req, res) => {
  try {
    const { idassessment } = req.params;
    const { name, type, month, day, percentage } = req.body;
    const student_id = req.student.id;

    if (type && !validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({
        error: `Tipo no válido. Usa: ${validTypes.join(", ")}`,
      });
    }

    let duedateStr;
    let duedateObj;
    if (month && day) {
      const year = new Date().getFullYear();
      duedateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      duedateObj = new Date(duedateStr + "T00:00:00");

      if (isNaN(duedateObj)) {
        return res.status(400).json({ error: "Fecha inválida" });
      }
    }

    const result = await assessmentService.update(idassessment, student_id, {
      ...(name && { name }),
      ...(type && { type: type.toLowerCase() }),
      ...(duedateStr && { duedate: duedateStr }),
      ...(percentage && { percentage }),
    });

    if (!result) {
      return res.status(404).json({
        error: "Actividad no encontrada o no tienes permiso para editarla",
      });
    }

    res.status(200).json({
      message: "Actividad actualizada correctamente",
      assessment: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    const { idassessment } = req.params;
    const student_id = req.student.id;

    const result = await assessmentService.delete(idassessment, student_id);

    if (!result) {
      return res.status(404).json({
        error: "Actividad no encontrada o no tienes permiso para eliminarla",
      });
    }

    res.status(200).json({ message: "Actividad eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
