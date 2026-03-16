const supabase = require("../config/supabase");

exports.createStudent = async (user) => {
  const { data: existing, error: checkError } = await supabase
    .from("student")
    .select("*")
    .eq("idstudent", user.id);

  if (checkError) {
    console.error(checkError);
    return null;
  }

  if (!existing || existing.length === 0) {
    const { error } = await supabase.from("student").insert({
      idstudent: user.id,
      name: user.user_metadata.name,
      lastname: user.user_metadata.lastname,
      email: user.email,
    });
    if (error) {
      console.error(error);
    }
  }

  return user;
};

exports.authStudent = async (student) => {
  const { name, lastname, email, password } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        lastname,
      },
    },
  });

  if (error) {
    throw error;
  }
  return data;
};
