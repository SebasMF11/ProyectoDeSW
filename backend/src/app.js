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
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origin (como cURL, mobile o server-to-server) o si está en la lista permitida
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo/previews permite la conexión
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Importar todas las rutas del módulo
const semesterRoutes = require("./routes/SemesterRoutes");
const studentRoutes = require("./routes/StudentRoutes");
const courseRoutes = require("./routes/CourseRoutes");
const assessmentRoutes = require("./routes/AssessmentRoutes");
const dayRoutes = require("./routes/DayRoutes");
const gradeRoutes = require("./routes/GradeRoutes");
const catalogRoutes = require("./routes/CatalogRoutes");
const enrollmentRoutes = require("./routes/EnrollmentRoutes");
const reportRoutes = require("./routes/ReportRoutes");

// Registrar rutas en la aplicación
app.use("/grade", gradeRoutes);
app.use("/day", dayRoutes);
app.use("/assessment", assessmentRoutes);
app.use("/course", courseRoutes);
app.use("/semester", semesterRoutes);
app.use("/catalog", catalogRoutes);
app.use("/student", studentRoutes);
app.use("/enrollment", enrollmentRoutes);
app.use("/reports", reportRoutes);

// Endpoint de verificación
app.get("/", (req, res) => {
  res.send("Backend 🚀");
});

module.exports = app;
