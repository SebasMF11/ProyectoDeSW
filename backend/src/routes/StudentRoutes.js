/**
 * ARCHIVO: StudentRoutes.js
 * PROPÓSITO: Define endpoints HTTP relacionados con estudiantes
 *
 * PATRÓN:
 * router.METHOD(PATH, [MIDDLEWARE], HANDLER)
 * - METHOD: post, get, put, delete
 * - PATH: ruta del endpoint
 * - MIDDLEWARE: (opcional) funciones que se ejecutan antes del handler
 * - HANDLER: función del controller que maneja la petición
 *
 * ENDPOINTS:
 * - POST /student/auth - Registro (público)
 * - POST /student/login - Login (público)
 * - GET /student/view - Obtener datos (PROTEGIDO)
 * - GET /student/me - Obtener estudiante autenticado (PROTEGIDO)
 */

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const studentController = require("../controllers/StudentController");

/**
 * POST /student/auth
 * Registro de nuevo estudiante
 * PÚBLICO - no requiere autenticación
 */
router.post("/auth", studentController.authStudent);

/**
 * POST /student/login
 * Autenticación de estudiante
 * PÚBLICO - retorna JWT token
 */
router.post("/login", studentController.loginStudent);

/**
 * GET /student/view
 * Obtener datos del estudiante autenticado
 * PROTEGIDO - requiere authMiddleware
 * authMiddleware valida token JWT en Authorization header
 */
router.get("/view", authMiddleware, studentController.getStudent);
router.put("/update", authMiddleware, studentController.updateStudent);
router.put("/password", authMiddleware, studentController.updatePassword);

/**
 * GET /student/me
 * Endpoint simplificado para obtener datos del usuario actual
 * PROTEGIDO - requiere authMiddleware
 * Responde con el objeto req.student establecido por authMiddleware
 */
router.get("/me", authMiddleware, (req, res) => {
  res.json({ student: req.student });
});

module.exports = router;
