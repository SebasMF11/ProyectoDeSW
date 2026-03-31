const { options } = require("../app");
const studentService = require("../services/StudentService");

exports.authStudent = async (req, res) => {
  try {
    const { name, lastName, email, password, password2 } = req.body;
    console.log(password2);
    console.log(lastName);
    if (!name || !lastName || !email || !password || !password2) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }
    if (password !== password2) {
      return res.status(400).json({
        error: "Las contraseñas no coinciden",
      });
    }

    const authResult = await studentService.authStudent({
      name,
      lastName,
      email,
      password,
    });
    res.status(201).json(authResult);
  } catch (error) {
    console.log(this.authStudent);
    res.status(500).json({ error: "Error autenticando estudiante" });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const user = req.body;
    const result = await studentService.createStudent(user);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: "Error creando estudiante" });
  }
};
