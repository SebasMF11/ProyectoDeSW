const supabase = require("../config/supabase");

/* exports.getAssessmentById = async (assessmentId, student_id) => {
  const { data, error } = await supabase
    .from("assessment")
    .select("assessment_id, course!inner(semester!inner(student_id))")
    .eq("assessment_id", assessmentId)
    .eq("course.semester.student_id", student_id)
    .single();

  if (error) return null;
  return data;
}; */

exports.checkGradeExists = async (assessmentId, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "grade_id, assessment!inner(course!inner(status, semester!inner(student_id)))",
    )
    .eq("assessment_id", assessmentId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", true)
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

exports.getByCourse = async (courseId, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "grade_id, value, assessment!inner(name_assessment, type, percentage, due_date, course_id, course!inner(course_name, semester!inner(student_id)))",
    )
    .eq("assessment.course_id", courseId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", true);

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map((g) => ({
    gradeId: g.grade_id,
    value: g.value,
    assessment: {
      name: g.assessment.assessment_name,
      type: g.assessment.type,
      percentage: g.assessment.percentage,
      dueDate: g.assessment.due_date,
      courseName: g.assessment.course.course_name,
    },
  }));
};

exports.update = async (gradeId, student_id, value) => {
  const { data: grade, error: findError } = await supabase
    .from("grade")
    .select(
      "grade_id, assessment!inner(course!inner(status, semester!inner(student_id)))",
    )
    .eq("grade_id", gradeId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", true)
    .single();

  if (findError || !grade) return null;

  const { data, error } = await supabase
    .from("grade")
    .update({ value })
    .eq("grade_id", gradeId)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (gradeId, student_id) => {
  const { data: grade, error: findError } = await supabase
    .from("grade")
    .select(
      "grade_id, assessment!inner(course!inner(semester!inner(student_id)))",
    )
    .eq("grade_id", gradeId)
    .eq("assessment.course.semester.student_id", student_id)
    .single();

  if (findError || !grade) return null;

  const { error } = await supabase
    .from("grade")
    .delete()
    .eq("grade_id", gradeId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};
exports.getAssessmentByNameAndSemester = async (
  assessmentName,
  courseName,
  semesterName,
  student_id,
) => {
  const { data, error } = await supabase
    .from("assessment")
    .select(
      "assessment_id, course!inner(course_name, semester!inner(semester_name, student_id))",
    )
    .eq("assessment_name", assessmentName)
    .eq("course.course_name", courseName)
    .eq("course.semester.semester_name", semesterName)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", true)
    .single();

  if (error) return null;
  return data;
};
