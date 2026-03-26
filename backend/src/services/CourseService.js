const supabase = require("../config/supabase");

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("course")
    .select(
      "idcourse, coursename, teacher, credits, semester!inner(student_id)",
    )
    .eq("semester.student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getBySemester = async (semester_id) => {
  const { data, error } = await supabase
    .from("course")
    .select("coursename, teacher, credits")
    .eq("semester_id", semester_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getSemesterByName = async (semestername, student_id) => {
  const { data, error } = await supabase
    .from("semester")
    .select("*")
    .eq("semestername", semestername)
    .eq("student_id", student_id)
    .single();

  if (error) return null;
  return data;
};

exports.create = async (course) => {
  const { data, error } = await supabase
    .from("course")
    .insert([course])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.deleteCourse = async (idcourse, student_id) => {
  const { data: course, error: findError } = await supabase
    .from("course")
    .select("idcourse, semester!inner(student_id)")
    .eq("idcourse", idcourse)
    .eq("semester.student_id", student_id)
    .single();

  if (findError || !course) return null;

  const { error } = await supabase
    .from("course")
    .delete()
    .eq("idcourse", idcourse);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};

exports.updateCourse = async (idcourse, student_id, fields) => {
  const { data: course, error: findError } = await supabase
    .from("course")
    .select("idcourse, semester!inner(student_id)")
    .eq("idcourse", idcourse)
    .eq("semester.student_id", student_id)
    .single();

  if (findError || !course) return null;

  const { data, error } = await supabase
    .from("course")
    .update(fields)
    .eq("idcourse", idcourse)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
