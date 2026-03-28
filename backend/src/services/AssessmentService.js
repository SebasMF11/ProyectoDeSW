const supabase = require("../config/supabase");

exports.getCourseByName = async (coursename, student_id) => {
  const { data, error } = await supabase
    .from("course")
    .select("idcourse, semester!inner(student_id)")
    .eq("coursename", coursename)
    .eq("semester.student_id", student_id)
    .single();

  if (error) return null;
  return data;
};

exports.create = async (assessment) => {
  const { data, error } = await supabase
    .from("assessment")
    .insert([assessment])
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getSemesterByCourse = async (course_id) => {
  const { data, error } = await supabase
    .from("course")
    .select("semester!inner(idsemester, midtermweek, finalexamweek)")
    .eq("idcourse", course_id)
    .single();

  if (error) return null;
  return data.semester;
};

exports.getDaysByCourse = async (course_id) => {
  const { data, error } = await supabase
    .from("day")
    .select("dayofweek")
    .eq("course_id", course_id);

  if (error) return null;
  return data;
};

exports.checkAssessmentConflict = async (course_id, duedate) => {
  const { data, error } = await supabase
    .from("assessment")
    .select("*")
    .eq("course_id", course_id)
    .eq("duedate", duedate);

  if (error) return null;
  return data;
};

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "idassessment, name, type, duedate, percentage, course!inner(coursename, semester!inner(student_id))",
    )
    .eq("course.semester.student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getByCourse = async (course_id, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "idassessment, name, type, duedate, percentage, course!inner(coursename, semester!inner(student_id))",
    )
    .eq("course_id", course_id)
    .eq("course.semester.student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getBySemester = async (semester_id, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "idassessment, name, type, duedate, percentage, course!inner(coursename, semester!inner(idsemester, student_id))",
    )
    .eq("course.semester.idsemester", semester_id)
    .eq("course.semester.student_id", student_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.update = async (idassessment, student_id, fields) => {
  const { data: assessment, error: findError } = await supabase
    .from("assessment")
    .select("idassessment, course!inner(semester!inner(student_id))")
    .eq("idassessment", idassessment)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !assessment) return null;

  const { data, error } = await supabase
    .from("assessment")
    .update(fields)
    .eq("idassessment", idassessment)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (idassessment, student_id) => {
  const { data: assessment, error: findError } = await supabase
    .from("assessment")
    .select("idassessment, course!inner(semester!inner(student_id))")
    .eq("idassessment", idassessment)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !assessment) return null;

  const { error } = await supabase
    .from("assessment")
    .delete()
    .eq("idassessment", idassessment);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};

exports.getTotalPercentage = async (course_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select("percentage")
    .eq("course_id", course_id);

  if (error) return null;
  return data;
};
