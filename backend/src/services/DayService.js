const supabase = require("../config/supabase");

exports.getAll = async (course_id) => {
  const { data, error } = await supabase
    .from("day")
    .select("day_id, day_of_week, start_time, end_time, classroom")
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

exports.checkConflict = async (
  day_of_week,
  start_time,
  end_time,
  student_id,
) => {
  const { data, error } = await supabase
    .from("day")
    .select("*, course!inner(semester!inner(student_id))")
    .eq("day_of_week", day_of_week)
    .eq("course.semester.student_id", student_id)
    .lt("start_time", end_time)
    .gt("end_time", start_time);

  if (error) return null;
  return data;
};

exports.update = async (dayId, student_id, fields) => {
  const { data: day, error: findError } = await supabase
    .from("day")
    .select("day_id, course!inner(semester!inner(student_id))")
    .eq("day_id", dayId)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !day) return null;

  const { data, error } = await supabase
    .from("day")
    .update(fields)
    .eq("day_id", dayId)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.delete = async (dayId, student_id) => {
  const { data: day, error: findError } = await supabase
    .from("day")
    .select("day_id, course!inner(semester!inner(student_id))")
    .eq("day_id", dayId)
    .eq("course.semester.student_id", student_id)
    .single();

  if (findError || !day) return null;

  const { error } = await supabase.from("day").delete().eq("day_id", dayId);

  if (error) {
    console.error(error);
    throw error;
  }

  return true;
};
