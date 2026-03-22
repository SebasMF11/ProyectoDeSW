const supabase = require("../config/supabase");

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("semester")
    .select("*")
    .eq("student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.create = async (semester) => {
  const { data, error } = await supabase
    .from("semester")
    .insert([semester])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.update = async (idsemester, student_id, fields) => {
  const { data, error } = await supabase
    .from("semester")
    .update(fields)
    .eq("idsemester", idsemester)
    .eq("student_id", student_id)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
