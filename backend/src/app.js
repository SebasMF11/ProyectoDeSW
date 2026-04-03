/**
 * ARCHIVO: app.js
 * PROPÓSITO: Configuración principal de la aplicación Express
 *
 * RESPONSABILIDADES:
 * - Inicializar la aplicación Express
 * - Configurar middleware (CORS, JSON)
 * - Registrar todas las rutas de la API
 * - Servir el endpoint raíz "/"
 *
 * RUTAS DISPONIBLES:
 * - POST/GET /student - Autenticación y gestión de estudiantes
 * - POST/GET /semester - Crear y listar semestres académicos
 * - POST/GET /course - Crear y gestionar cursos
 * - POST/GET /assessment - Crear y gestionar evaluaciones/rubricas
 * - POST/GET /day - Gestionar días académicos
 * - POST/GET /grade - Crear y gestionar calificaciones
 *
 * FLUJO DE SEGURIDAD:
 * Protegido con authMiddleware que valida el token JWT del estudiante
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Configurar middleware global
app.use(cors());
app.use(express.json());

// Importar todas las rutas del módulo
const semesterRoutes = require("./routes/SemesterRoutes");
const studentRoutes = require("./routes/StudentRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const assessmentRoutes = require("./routes/AssessmentRoutes");
const dayRoutes = require("./routes/DayRoutes");
const gradeRoutes = require("./routes/GradeRoutes");

// Registrar rutas en la aplicación
app.use("/grade", gradeRoutes);
app.use("/day", dayRoutes);
app.use("/assessment", assessmentRoutes);
app.use("/course", courseRoutes);
app.use("/semester", semesterRoutes);
app.use(cors({ origin: "http://localhost:5173" })); // Permitir origen del frontend
app.use("/student", studentRoutes);

// Endpoint de verificación
app.get("/", (req, res) => {
  res.send("Backend 🚀");
});

module.exports = app;
