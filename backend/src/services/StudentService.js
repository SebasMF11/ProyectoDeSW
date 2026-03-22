const supabase = require("../config/supabase");

exports.authStudent = async (student) => {
  const { name, lastname, email, password } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, lastname },
    },
  });

  if (error) throw error;
  return data;
};

exports.loginStudent = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Inserta en tabla student si aún no existe 👇
  const { data: existing } = await supabase
    .from("student")
    .select("*")
    .eq("idstudent", data.user.id);

  if (!existing || existing.length === 0) {
    await supabase.from("student").insert({
      idstudent: data.user.id,
      name: data.user.user_metadata.name,
      lastname: data.user.user_metadata.lastname,
      email: data.user.email,
    });
  }

  return data;
};
