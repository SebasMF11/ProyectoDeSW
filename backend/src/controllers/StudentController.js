/**
 * ARCHIVO: StudentController.js
 * PROPÓSITO: Maneja las peticiones HTTP relacionadas con estudiantes
 *
 * PATRÓN ARQUITECTÓNICO:
 * Los controladores siguen la arquitectura en capas:
 * Controller (http) -> Service (lógica) -> Supabase (BD)
 *
 * RESPONSABILIDADES:
 * 1. Validar datos de entrada (req.body)
 * 2. Llamar a StudentService para lógica de negocio
 * 3. Manejar errores y responder con HTTP apropiado
 * 4. Retornar respuestas JSON estructuradas
 */

const studentService = require("../services/StudentService");

/**
 * FUNCIÓN: authStudent
 * MÉTODO: POST /student/auth
 * PROPÓSITO: Registrar un nuevo estudiante
 *
 * ENTRADA: { name, lastName, email, password, password2 }
 * SALIDA: { message: "Confirmation email sent, check your inbox 📧" }
 *
 * VALIDACIONES:
 * - Todos los campos son obligatorios
 * - Las contraseñas deben coincidir
 * - Email debe ser único
 *
 * MANEJO DE ERRORES:
 * - 400: Datos inválidos o incompletos
 * - 429: Demasiados intentos de registro
 * - 503: No se puede conectar a Supabase
 * - 500: Error interno
 */
exports.authStudent = async (req, res) => {
  try {
    const { name, lastName, email, password, password2 } = req.body;
    if (!name || !lastName || !email || !password || !password2) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }
    if (password !== password2) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    await studentService.authStudent({ name, lastName, email, password });

    res.status(201).json({
      message: "Confirmation email sent, check your inbox 📧",
    });
  } catch (error) {
    console.error("Error registro:", error);
    //todos los signos de pregunta son para evitar errores en caso de que el error no tenga esa propiedad
    if (error?.code === "over_email_send_rate_limit" || error?.status === 429) {
      return res.status(429).json({
        error:
          "Too many registration attempts. Please wait a moment before trying again.",
      });
    }

    if (
      error?.name === "AuthRetryableFetchError" ||
      error?.status === 0 ||
      error?.cause?.code === "ENOTFOUND"
    ) {
      return res.status(503).json({
        error:
          "Could not connect to the authentication service. Check your connection and try again.",
      });
    }

    res.status(500).json({ error: "Internal error while registering student" });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const authResult = await studentService.loginStudent({
      email,
      password,
    });

    res.status(200).json({
      token: authResult.session.access_token,
      message: "Login successful",
      user: authResult.user,
    });
  } catch (error) {
    console.error("Error login:", error);
    res.status(401).json({ error: error.message });
  }
};

exports.getStudent = async (req, res) => {
  try {
    const student_id = req.student.id;
    const student = await studentService.getStudent(student_id);
    res.status(200).json({ student });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { name, lastName, email } = req.body;
    const student_id = req.student.id;

    if (!name && !lastName && !email) {
      return res.status(400).json({ error: "At least one field is required" });
    }

    if (email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        return res.status(400).json({ error: authError.message });
      }
    }

    const result = await studentService.updateStudent(student_id, {
      ...(name && { name }),
      ...(lastName && { last_name: lastName }),
      ...(email && { email }),
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", student: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, newPassword2 } = req.body;
    const student_id = req.student.id;

    if (!currentPassword || !newPassword || !newPassword2) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (newPassword !== newPassword2) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Verificar contraseña actual
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: req.student.email,
      password: currentPassword,
    });

    if (loginError) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await studentService.updatePassword(newPassword);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
