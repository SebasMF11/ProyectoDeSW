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
    let career_id = data.user.user_metadata?.career_id || null;

    // Si career_id es null, usar el primer career disponible como fallback
    if (!career_id) {
      const { data: careers, error: careerError } = await supabase
        .from("career")
        .select("career_id")
        .limit(1)
        .single();
      
      if (careerError) {
        console.error("Failed to fetch fallback career:", careerError);
        throw new Error("No career_id provided and unable to fetch default career");
      }
      
      career_id = careers?.career_id;
      
      if (!career_id) {
        throw new Error("No career_id provided and no careers available in the system");
      }
    }

    const { error: insertError } = await supabase.from("student").insert({
      student_id: data.user.id,
      name: data.user.user_metadata?.name || "",
      last_name: data.user.user_metadata?.lastName || "",
      email: data.user.email,
      career_id,
    });

    if (insertError) {
      console.error(insertError);
      throw insertError;
    }
  }

  return data;
};

exports.authStudent = async (student) => {
  const { name, lastName, email, password, career_id } = student;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        lastName,
        career_id: career_id || null,
      },
    },
  });

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getStudent = async (student_id) => {
  const { data, error } = await supabase
    .from("student")
    .select("student_id, name, last_name, email, created_at, career!left(name)")
    .eq("student_id", student_id)
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.updateStudent = async (student_id, fields) => {
  const { data, error } = await supabase
    .from("student")
    .update(fields)
    .eq("student_id", student_id)
    .select("student_id, name, last_name, email, career_id");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.updatePassword = async (password) => {
  const { data, error } = await supabase.auth.updateUser({ password });

  if (error) throw error;
  return data;
};
