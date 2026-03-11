const supabase = require('../config/supabase');

exports.createStudent = async (student) => {

  const { data, error } = await supabase
    .from('student')
    .insert([student])
    .select();

  if (error) {
    throw error;
  }

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

