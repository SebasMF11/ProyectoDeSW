const { options } = require('../app');
const studentService = require('../services/StudentService');
exports.createStudent = async (req, res) => {

  try {

    const { name, lastname, email, password, password2 } = req.body;
    console.log("Datos recibidos:", req.body);
    
      console.log(password2 );
    if (!name || !lastname || !email || !password || !password2) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
        
      });
    }

    if (password !== password2) {
      console.log("Error: Las contraseñas no coinciden");
      return res.status(400).json({
        error: "Las contraseñas no coinciden"
      });
    }

const authResult = await studentService.authStudent({
  name,
  lastname,
  email,
  password
});

const userId = authResult.user.id;

const student = await studentService.createStudent({
  idstudent: userId,
  name,
  lastname,
  email
});

  res.status(201).json(student);

  } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error creando estudiante" });
}

};
