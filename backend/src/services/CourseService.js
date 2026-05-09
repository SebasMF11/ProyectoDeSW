const supabase = require("../config/supabase");

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("course")
    .select(
      "course_id, teacher, credits, color, courses!inner(name), semester!inner(student_id)",
    )
    .eq("semester.student_id", student_id)
    .eq("status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getBySemester = async (semester_id) => {
  const { data, error } = await supabase
    .from("course")
    .select("course_id, teacher, credits, color, courses!inner(name)")
    .eq("semester_id", semester_id)
    .eq("status", "active");

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
    .eq("name", semesterName)
    .eq("student_id", student_id)
    .single();

  if (error) return null;
  return data;
};

exports.create = async (course) => {
  const { data, error } = await supabase
    .from("course")
    .insert([course])
    .select("course_id, teacher, credits, color, courses!inner(name)");

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

  const { data: assessments } = await supabase
    .from("assessment")
    .select("assessment_id")
    .eq("course_id", courseId);

  if (assessments && assessments.length > 0) {
    const assessmentIds = assessments.map((a) => a.assessment_id);
    await supabase.from("grade").delete().in("assessment_id", assessmentIds);
  }

  await supabase.from("assessment").delete().eq("course_id", courseId);
  await supabase.from("day").delete().eq("course_id", courseId);

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
    .eq("status", "active")
    .single();

  if (findError || !course) return null;

  const { data, error } = await supabase
    .from("course")
    .update(fields)
    .eq("course_id", courseId)
    .select("course_id, teacher, credits, color, courses!inner(name)");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.updateStatus = async (courseId, student_id, status) => {
  const { data: course, error: findError } = await supabase
    .from("course")
    .select("course_id, semester!inner(student_id)")
    .eq("course_id", courseId)
    .eq("semester.student_id", student_id)
    .single();

  if (findError || !course) return null;

  const { data, error } = await supabase
    .from("course")
    .update({ status })
    .eq("course_id", courseId)
    .select("course_id, teacher, credits, color, status, courses!inner(name)");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

// Busca un curso por su courses_id (catálogo) dentro de un semestre del estudiante
exports.getCourseByCoursesIdAndSemester = async (
  courses_id,
  semesterName,
  student_id,
) => {
  const { data, error } = await supabase
    .from("course")
    .select("course_id, courses_id, semester!inner(name, student_id)")
    .eq("courses_id", courses_id)
    .eq("semester.name", semesterName)
    .eq("semester.student_id", student_id)
    .eq("status", "active")
    .single();

  if (error) return null;
  return data;
};
