const { options } = require('../app');
const studentService = require('../services/StudentService');

exports.createStudent = async (req, res) => {

  try {

    const { name, lastname, email, password, confirmPassword } = req.body;

    if (!name || !lastname || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios"
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Las contraseñas no coinciden"
      });
    }





/*

    const { data, error } = await supabase.auth.signUp({
      email: '',
      password: '',
      options: {
      data: {
        studentname: '',
        lastname: '',
      }
    }
    } 
);
 */






    const student = await studentService.createStudent({
      name,
      lastname,
      email,
      password
    });

    res.status(201).json(student);

  } catch (error) {
  console.error(error);
  res.status(500).json({ error: "Error creando estudiante" });
}

};
