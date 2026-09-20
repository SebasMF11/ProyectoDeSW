/**
 * ARCHIVO: EnrollmentRoutes.js
 * PROPÓSITO: Rutas de la pantalla transaccional de matrícula en bloque
 */

const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/EnrollmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Pre-validación en tiempo real (límite 26 créditos, prerrequisitos, solapes)
router.post("/validate", authMiddleware, enrollmentController.validate);

// Confirmación y procesamiento atómico de la matrícula en bloque
router.post("/process", authMiddleware, enrollmentController.process);

module.exports = router;
