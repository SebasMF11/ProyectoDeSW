/**
 * ARCHIVO: ReportRoutes.js
 * PROPÓSITO: Rutas para consulta de los 2 reportes académicos
 */

const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");
const authMiddleware = require("../middlewares/authMiddleware");

// Reporte 1: Boletín de notas, promedio ponderado semestral (PPS) y GPA acumulado
router.get("/transcript", authMiddleware, reportController.getAcademicTranscript);

// Reporte 2: Horario semanal interactivo y agenda cronológica de próximas evaluaciones
router.get("/schedule", authMiddleware, reportController.getScheduleAndAgenda);

module.exports = router;
