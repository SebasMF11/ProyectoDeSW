const supabase = require('../config/supabase');

exports.createStudent = async (email,password) => {
 
  const password= password
  const email = email
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    const student = data;
    if (error) {
      console.error(error);
    }
  
 console.log("Datos del estudiante autenticado:", student);
    const { errori } = await supabase
      .from('student')
      .insert({ id: student.id, name: student.name, lastname: student.lastname, email: student.email, password });
    return data;

};

exports.authStudent = async (student) => {

  const { name, lastname, email, password } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        lastname
      }
    }
  });
  if (error) {
    throw error;
  }
  return data;
};

