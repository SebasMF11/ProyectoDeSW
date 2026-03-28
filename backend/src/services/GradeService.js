const supabase = require("../config/supabase");

exports.getAssessmentById = async (idassessment, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select("idassessment, course!inner(semester!inner(student_id))")
    .eq("idassessment", idassessment)
    .eq("course.semester.student_id", student_id)
    .single();

  if (error) return null;
  return data;
};

exports.checkGradeExists = async (assessment_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select("idgrade")
    .eq("assessment_id", assessment_id)
    .single();

  if (error) return null;
  return data;
};

exports.create = async (grade) => {
  const { data, error } = await supabase.from("grade").insert([grade]).select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getByCourse = async (course_id, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "idgrade, value, assessment!inner(name, type, percentage, duedate, course_id, course!inner(coursename, semester!inner(student_id)))",
    )
    .eq("assessment.course_id", course_id)
    .eq("assessment.course.semester.student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.update = async (idgrade, student_id, value) => {
  // Verificar que la nota pertenece al estudiante
  const { data: grade, error: findError } = await supabase
    .from("grade")
    .select(
      "idgrade, assessment!inner(course!inner(semester!inner(student_id)))",
    )
    .eq("idgrade", idgrade)
    .eq("assessment.course.semester.student_id", student_id)
    .single();

  if (findError || !grade) return null;

  const { data, error } = await supabase
    .from("grade")
    .update({ value })
    .eq("idgrade", idgrade)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (idgrade, student_id) => {
  // Verificar que la nota pertenece al estudiante
  const { data: grade, error: findError } = await supabase
    .from("grade")
    .select(
      "idgrade, assessment!inner(course!inner(semester!inner(student_id)))",
    )
    .eq("idgrade", idgrade)
    .eq("assessment.course.semester.student_id", student_id)
    .single();

  if (findError || !grade) return null;

  const { error } = await supabase
    .from("grade")
    .delete()
    .eq("idgrade", idgrade);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};
