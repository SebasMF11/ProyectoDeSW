const supabase = require("../config/supabase");

const getGradeRecord = (assessment) =>
  Array.isArray(assessment.grade)
    ? (assessment.grade[0] ?? null)
    : (assessment.grade ?? null);

exports.getCourseByNameAndSemester = async (
  courseName,
  semesterName,
  student_id,
) => {
  const { data, error } = await supabase
    .from("course")
    .select("course_id, courses!inner(name), semester!inner(name, student_id)")
    .eq("courses.name", courseName)
    .eq("semester.name", semesterName)
    .eq("semester.student_id", student_id)
    .eq("status", "active")
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
    .eq("status", "active")
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
  // Comparar solo la parte de fecha (ignorar hora) usando rango del día
  const dayStart = `${due_date.split("T")[0]}T00:00:00+00:00`;
  const dayEnd = `${due_date.split("T")[0]}T23:59:59+00:00`;

  let query = supabase
    .from("assessment")
    .select("*, course!inner(status)")
    .eq("course_id", course_id)
    .gte("due_date", dayStart)
    .lte("due_date", dayEnd)
    .eq("course.status", "active");

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
      "assessment_id, name, type, due_date, percentage, course!inner(courses!inner(name), semester!inner(student_id))",
    )
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active");

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
      "assessment_id, name, type, due_date, percentage, course!inner(courses!inner(name), semester!inner(student_id))",
    )
    .eq("course_id", course_id)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active");

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
      "assessment_id, name, type, due_date, percentage, course!inner(courses!inner(name), semester!inner(semester_id, student_id))",
    )
    .eq("course.semester.semester_id", semester_id)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active");

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
    .eq("course.status", "active")
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
    .select("percentage, course!inner(status)")
    .eq("course_id", course_id)
    .eq("course.status", "active");

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
    .eq("course.status", "active")
    .single();

  if (error) return null;
  return data;
};

exports.getAssessmentsByDay = async (date, student_id) => {
  const dayStart = `${date}T00:00:00+00:00`;
  const dayEnd = `${date}T23:59:59+00:00`;

  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, name, type, due_date, percentage, course!inner(color, courses!inner(name), semester!inner(student_id)), grade:grade(grade_id, value)",
    )
    .gte("due_date", dayStart)
    .lte("due_date", dayEnd)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map((assessment) => ({
    ...assessment,
    has_grade: Boolean(getGradeRecord(assessment)),
    grade_value: getGradeRecord(assessment)?.value ?? null,
  }));
};

exports.getAssessmentsByMonth = async (year, month, student_id) => {
  const startDate = `${year}-${month.toString().padStart(2, "0")}-01T00:00:00+00:00`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const endDate = `${nextYear}-${nextMonth.toString().padStart(2, "0")}-01T00:00:00+00:00`;

  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, name, type, due_date, percentage, course!inner(color, courses!inner(name), semester!inner(student_id)), grade:grade(grade_id, value)",
    )
    .gte("due_date", startDate)
    .lt("due_date", endDate)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map((assessment) => ({
    ...assessment,
    has_grade: Boolean(getGradeRecord(assessment)),
    grade_value: getGradeRecord(assessment)?.value ?? null,
  }));
};
