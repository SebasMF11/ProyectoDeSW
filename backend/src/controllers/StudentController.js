const studentService = require("../services/StudentService");

exports.authStudent = async (req, res) => {
  try {
    const { name, lastName, email, password, password2 } = req.body;
    if (!name || !lastName || !email || !password || !password2) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
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
          "Demasiados intentos de registro. Espera un momento antes de volver a intentar.",
      });
    }

    if (
      error?.name === "AuthRetryableFetchError" ||
      error?.status === 0 ||
      error?.cause?.code === "ENOTFOUND"
    ) {
      return res.status(503).json({
        error:
          "No se pudo conectar con el servicio de autenticacion. Verifica tu conexion e intenta nuevamente.",
      });
    }

    res.status(500).json({ error: "Error interno al registrar estudiante" });
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
