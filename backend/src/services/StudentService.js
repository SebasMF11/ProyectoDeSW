const supabase = require("../config/supabase");

exports.authStudent = async (student) => {
  const { name, lastName, email, password } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, lastName },
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

  const { data: existing } = await supabase
    .from("student")
    .select("*")
    .eq("student_id", data.user.id);

  if (!existing || existing.length === 0) {
    await supabase.from("student").insert({
      student_id: data.user.id,
      name: data.user.user_metadata.name,
      last_name: data.user.user_metadata.lastName,
      email: data.user.email,
    });
  }

  return data;
};

exports.getStudent = async (student_id) => {
  const { data, error } = await supabase
    .from("student")
    .select("name, last_name, email")
    .eq("student_id", student_id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
