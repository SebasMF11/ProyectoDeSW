/**
 * ARCHIVO: ReportController.js
 * PROPÓSITO: Controlador HTTP para los 2 reportes académicos del sistema
 */

const reportService = require("../services/ReportService");

exports.getAcademicTranscript = async (req, res) => {
  try {
    const student_id = req.student.id;
    const { semesterId } = req.query;

    const report = await reportService.getAcademicTranscript(
      student_id,
      semesterId || null
    );

    res.status(200).json(report);
  } catch (error) {
    console.error("Error al generar boletín académico:", error);
    res.status(500).json({ error: error.message || "Error al generar reporte de calificaciones" });
  }
};

exports.getScheduleAndAgenda = async (req, res) => {
  try {
    const student_id = req.student.id;
    const { semesterId } = req.query;

    const report = await reportService.getScheduleAndAgenda(
      student_id,
      semesterId || null
    );

    res.status(200).json(report);
  } catch (error) {
    console.error("Error al generar horario y agenda:", error);
    res.status(500).json({ error: error.message || "Error al generar horario semanal" });
  }
};
