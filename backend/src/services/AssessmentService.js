const supabase = require("../config/supabase");

exports.getCourseByNameAndSemester = async (
  courseName,
  semesterName,
  student_id,
) => {
  const { data, error } = await supabase
    .from("course")
    .select("course_id, semester!inner(semester_name, student_id)")
    .eq("course_name", courseName)
    .eq("semester.semester_name", semesterName)
    .eq("semester.student_id", student_id)
    .eq("status", true)
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
    .select(
      "semester!inner(semester_id, start_date, end_date, midterm_week, final_exam_week)",
    )
    .eq("course_id", course_id)
    .eq("status", true)
    .single();

  if (error) return null;
  return data.semester;
};

exports.getDaysByCourse = async (course_id) => {
  const { data, error } = await supabase
    .from("day")
    .select("day_of_week")
    .eq("course_id", course_id);

  if (error) return null;
  return data;
};

exports.checkAssessmentConflict = async (
  course_id,
  due_date,
  excludeAssessmentId = null,
) => {
  let query = supabase
    .from("assessment")
    .select("*")
    .eq("course_id", course_id)
    .eq("due_date", due_date)
    .eq("course.status", true);

  if (excludeAssessmentId) {
    query = query.neq("assessment_id", excludeAssessmentId);
  }

  const { data, error } = await query;
  if (error) return null;
  return data;
};

exports.getAll = async (student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, assessment_name, type, due_date, percentage, course!inner(course_name, semester!inner(student_id))",
    )
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true);

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
      "assessment_id, assessment_name, type, due_date, percentage, course!inner(course_name, semester!inner(student_id))",
    )
    .eq("course_id", course_id)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true);

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
      "assessment_id, assessment_name, type, due_date, percentage, course!inner(course_name, semester!inner(semester_id, student_id))",
    )
    .eq("course.semester.semester_id", semester_id)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.update = async (assessmentId, student_id, fields) => {
  const { data: assessment, error: findError } = await supabase
    .from("assessment")
    .select("assessment_id, course!inner(status, semester!inner(student_id))")
    .eq("assessment_id", assessmentId)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true)
    .single();

  if (findError || !assessment) return null;

  const { data, error } = await supabase
    .from("assessment")
    .update(fields)
    .eq("assessment_id", assessmentId)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (assessmentId, student_id) => {
  const { data: assessment, error: findError } = await supabase
    .from("assessment")
    .select("assessment_id, course!inner(semester!inner(student_id))")
    .eq("assessment_id", assessmentId)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !assessment) return null;

  await supabase.from("grade").delete().eq("assessment_id", assessmentId);

  const { error } = await supabase
    .from("assessment")
    .delete()
    .eq("assessment_id", assessmentId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};

exports.getTotalPercentage = async (course_id, excludeAssessmentId = null) => {
  let query = supabase
    .from("assessment")
    .select("percentage")
    .eq("course_id", course_id)
    .eq("course.status", true);

  if (excludeAssessmentId) {
    query = query.neq("assessment_id", excludeAssessmentId);
  }

  const { data, error } = await query;
  if (error) return null;
  return data;
};

exports.getAssessmentById = async (assessmentId, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, type, due_date, course_id, percentage, course!inner(semester!inner(student_id))",
    )
    .eq("assessment_id", assessmentId)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true)
    .single();

  if (error) return null;
  return data;
};

exports.getAssessmentsByDay = async (date, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, assessment_name, type, due_date, percentage, course!inner(course_name, semester!inner(student_id))",
    )
    .eq("due_date", date)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getAssessmentsByMonth = async (year, month, student_id) => {
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, assessment_name, type, due_date, percentage, course!inner(course_name, semester!inner(student_id))",
    )
    .gte("due_date", startDate)
    .lt("due_date", endDate)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};
