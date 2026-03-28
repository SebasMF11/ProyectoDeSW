const supabase = require("../config/supabase");

exports.getAll = async (course_id) => {
  const { data, error } = await supabase
    .from("day")
    .select("idday, dayofweek, starttime, endtime, classroom")
    .eq("course_id", course_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.create = async (day) => {
  const { data, error } = await supabase.from("day").insert([day]).select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.checkConflict = async (dayofweek, starttime, endtime, student_id) => {
  const { data, error } = await supabase
    .from("day")
    .select("*, course!inner(semester!inner(student_id))")
    .eq("dayofweek", dayofweek)
    .eq("course.semester.student_id", student_id)
    .lt("starttime", endtime)
    .gt("endtime", starttime);

  if (error) return null;
  return data;
};

exports.update = async (idday, student_id, fields) => {
  const { data: day, error: findError } = await supabase
    .from("day")
    .select("idday, course!inner(semester!inner(student_id))")
    .eq("idday", idday)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !day) return null;

  const { data, error } = await supabase
    .from("day")
    .update(fields)
    .eq("idday", idday)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (idday, student_id) => {
  const { data: day, error: findError } = await supabase
    .from("day")
    .select("idday, course!inner(semester!inner(student_id))")
    .eq("idday", idday)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !day) return null;

  const { error } = await supabase.from("day").delete().eq("idday", idday);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};
