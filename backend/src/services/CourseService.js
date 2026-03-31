const supabase = require("../config/supabase");

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("course")
    .select(
      "course_id, course_name, teacher, credits, semester!inner(student_id)",
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
    .select("course_name, teacher, credits")
    .eq("semester_id", semester_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getSemesterByName = async (semesterName, student_id) => {
  const { data, error } = await supabase
    .from("semester")
    .select("*")
    .eq("semester_name", semesterName)
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

exports.deleteCourse = async (courseId, student_id) => {
  const { data: course, error: findError } = await supabase
    .from("course")
    .select("course_id, semester!inner(student_id)")
    .eq("course_id", courseId)
    .eq("semester.student_id", student_id)
    .single();

  if (findError || !course) return null;

  const { error } = await supabase
    .from("course")
    .delete()
    .eq("course_id", courseId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};

exports.updateCourse = async (courseId, student_id, fields) => {
  const { data: course, error: findError } = await supabase
    .from("course")
    .select("course_id, semester!inner(student_id)")
    .eq("course_id", courseId)
    .eq("semester.student_id", student_id)
    .single();

  if (findError || !course) return null;

  const { data, error } = await supabase
    .from("course")
    .update(fields)
    .eq("course_id", courseId)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
