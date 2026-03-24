const studentService = require("../services/StudentService");

exports.authStudent = async (req, res) => {
  try {
    const { name, lastname, email, password, password2 } = req.body;

    if (!name || !lastname || !email || !password || !password2) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    if (password !== password2) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    await studentService.authStudent({ name, lastname, email, password });

    res.status(201).json({
      message: "Correo de confirmación enviado, revisa tu bandeja 📧",
    });
  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email y contraseña son obligatorios" });
    }

    const result = await studentService.loginStudent({ email, password });

    // Si el correo no fue confirmado, Supabase no dejará hacer login
    res.status(200).json({
      token: result.session.access_token,
      student: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.user_metadata.name,
        lastname: result.user.user_metadata.lastname,
      },
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
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
