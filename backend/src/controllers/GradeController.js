const gradeService = require("../services/GradeService");

exports.createGrade = async (req, res) => {
  try {
    const { assessment_id, value } = req.body;
    const student_id = req.student.id;

    if (!assessment_id || value === undefined) {
      return res
        .status(400)
        .json({ error: "assessment_id y value son obligatorios" });
    }

    // Validar escala colombiana 0.0 a 5.0
    if (value < 0 || value > 5) {
      return res
        .status(400)
        .json({ error: "La nota debe estar entre 0.0 y 5.0" });
    }

    // Verificar que la actividad pertenece al estudiante
    const assessment = await gradeService.getAssessmentById(
      assessment_id,
      student_id,
    );
    if (!assessment) {
      return res
        .status(404)
        .json({ error: "Actividad no encontrada o no tienes permiso" });
    }

    // Verificar que la actividad no tenga ya una nota
    const existing = await gradeService.checkGradeExists(assessment_id);
    if (existing) {
      return res
        .status(400)
        .json({ error: "Esta actividad ya tiene una nota asignada" });
    }

    const grade = await gradeService.create({
      assessment_id,
      value,
    });

    res.status(201).json({
      message: "Nota creada correctamente",
      grade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.getGradesByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const student_id = req.student.id;

    const grades = await gradeService.getByCourse(course_id, student_id);
    res.status(200).json({ grades });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.updateGrade = async (req, res) => {
  try {
    const { idgrade } = req.params;
    const { value } = req.body;
    const student_id = req.student.id;

    if (value === undefined) {
      return res.status(400).json({ error: "value es obligatorio" });
    }

    // Validar escala colombiana
    if (value < 0 || value > 5) {
      return res
        .status(400)
        .json({ error: "La nota debe estar entre 0.0 y 5.0" });
    }

    const result = await gradeService.update(idgrade, student_id, value);

    if (!result) {
      return res.status(404).json({
        error: "Nota no encontrada o no tienes permiso para editarla",
      });
    }

    res.status(200).json({
      message: "Nota actualizada correctamente",
      grade: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const { idgrade } = req.params;
    const student_id = req.student.id;

    const result = await gradeService.delete(idgrade, student_id);

    if (!result) {
      return res
        .status(404)
        .json({
          error: "Nota no encontrada o no tienes permiso para eliminarla",
        });
    }

    res.status(200).json({ message: "Nota eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
