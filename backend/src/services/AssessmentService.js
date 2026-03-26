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
