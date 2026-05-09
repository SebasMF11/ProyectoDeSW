const supabase = require("../config/supabase");

exports.checkGradeExists = async (assessmentId, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "grade_id, assessment!inner(course!inner(status, semester!inner(student_id)))",
    )
    .eq("assessment_id", assessmentId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", "active")
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
      "grade_id, value, assessment!inner(name, type, percentage, due_date, course_id, course!inner(courses!inner(name), semester!inner(student_id)))",
    )
    .eq("assessment.course_id", courseId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map((g) => ({
    gradeId: g.grade_id,
    value: g.value,
    assessment: {
      name: g.assessment.name,
      type: g.assessment.type,
      percentage: g.assessment.percentage,
      dueDate: g.assessment.due_date,
      courseName: g.assessment.course.courses.name,
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
    .eq("assessment.course.status", "active")
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
      "assessment_id, course!inner(courses!inner(name), semester!inner(name, student_id))",
    )
    .eq("name", assessmentName)
    .eq("course.courses.name", courseName)
    .eq("course.semester.name", semesterName)
    .eq("course.semester.student_id", student_id)
    .eq("course.status", "active")
    .single();

  if (error) return null;
  return data;
};

// Nota actual de una materia (cuánto lleva acumulado)
exports.getCurrentGradeByCourse = async (courseId, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "value, assessment!inner(percentage, course!inner(status, semester!inner(student_id)))",
    )
    .eq("assessment.course_id", courseId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  const evaluatedPercentage = data.reduce(
    (acc, g) => acc + g.assessment.percentage,
    0,
  );
  const currentGrade = data.reduce(
    (acc, g) => acc + (g.value * g.assessment.percentage) / 100,
    0,
  );

  return {
    currentGrade: Math.round(currentGrade * 100) / 100,
    evaluatedPercentage,
    remainingPercentage: 100 - evaluatedPercentage,
  };
};

// Promedio semestral ponderado
exports.getSemesterAverage = async (semesterId, student_id) => {
  const { data, error } = await supabase
    .from("grade")
    .select(
      "value, assessment!inner(percentage, course!inner(status, semester_id, semester!inner(student_id)))",
    )
    .eq("assessment.course.semester_id", semesterId)
    .eq("assessment.course.semester.student_id", student_id)
    .eq("assessment.course.status", "active");

  if (error) {
    console.error(error);
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      semesterAverage: 0,
      evaluatedPercentage: 0,
      remainingPercentage: 100,
    };
  }

  const evaluatedPercentage = data.reduce(
    (acc, g) => acc + g.assessment.percentage,
    0,
  );
  const semesterAverage = data.reduce(
    (acc, g) => acc + (g.value * g.assessment.percentage) / 100,
    0,
  );

  return {
    semesterAverage: Math.round(semesterAverage * 100) / 100,
    evaluatedPercentage,
    remainingPercentage: 100 - evaluatedPercentage,
  };
};
