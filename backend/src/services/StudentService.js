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
    .eq("student_id", user.id);

  if (checkError) {
    console.error(checkError);
    return null;
  }

  if (!existing || existing.length === 0) {
    const { error } = await supabase.from("student").insert({
      student_id: user.id,
      name: user.user_metadata.name,
      last_name: user.user_metadata.lastName,
      email: user.email,
    });
  }

  return data;
};

exports.authStudent = async (student) => {
  const { name, lastName, email, password } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        lastName,
      },
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
