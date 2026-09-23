/**
 * ARCHIVO: EnrollmentController.js
 * PROPÓSITO: Controlador HTTP para las peticiones de matrícula semestral en bloque
 */

const enrollmentService = require("../services/EnrollmentService");

exports.validate = async (req, res) => {
  try {
    const student_id = req.student.id;
    const { semester_id, courses } = req.body;

    const result = await enrollmentService.validateEnrollment(
      student_id,
      semester_id,
      courses
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error en pre-validación de matrícula:", error.message);
    res.status(400).json({ error: error.message || "Error al validar la matrícula" });
  }
};

exports.process = async (req, res) => {
  try {
    const student_id = req.student.id;
    const { semester_id, courses } = req.body;

    const result = await enrollmentService.processEnrollment(
      student_id,
      semester_id,
      courses
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Error al procesar matrícula:", error.message);
    res.status(400).json({ error: error.message || "Error al procesar la matrícula" });
  }
};
