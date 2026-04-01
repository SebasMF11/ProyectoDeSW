const supabase = require("../config/supabase");

exports.loginStudent = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: existing, error: checkError } = await supabase
    .from("student")
    .select("*")
    .eq("student_id", data.user.id);

  if (checkError) {
    console.error(checkError);
    throw checkError;
  }

  if (!existing || existing.length === 0) {
    const { error: insertError } = await supabase.from("student").insert({
      student_id: data.user.id,
      name: data.user.user_metadata?.name || "",
      last_name: data.user.user_metadata?.lastName || "",
      email: data.user.email,
    });

    if (insertError) {
      console.error(insertError);
      throw insertError;
    }
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
