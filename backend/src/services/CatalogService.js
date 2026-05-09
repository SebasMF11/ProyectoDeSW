const supabase = require("../config/supabase");

// ── Careers ──────────────────────────────────────────────────────────────────

exports.getAllCareers = async () => {
  const { data, error } = await supabase
    .from("career")
    .select("career_id, name")
    .order("name");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

// ── Faculties ─────────────────────────────────────────────────────────────────

exports.getAllFaculties = async () => {
  const { data, error } = await supabase
    .from("faculty")
    .select("faculty_id, name")
    .order("name");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

// ── Courses catalog ───────────────────────────────────────────────────────────

exports.getAllCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("courses_id, name, faculty(faculty_id, name), prerequisito")
    .order("name");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getCoursesByFaculty = async (faculty_id) => {
  const { data, error } = await supabase
    .from("courses")
    .select("courses_id, name, faculty_id, prerequisito")
    .eq("faculty_id", faculty_id)
    .order("name");

  if (error) {
    console.error(error);
    throw error;
  }

  return data;
};

exports.getCoursesByCareer = async (career_id) => {
  const { data, error } = await supabase
    .from("courses_per_career")
    .select("courses!inner(courses_id, name, faculty!inner(name), prerequisito)")
    .eq("career_id", career_id);

  if (error) {
    console.error(error);
    throw error;
  }

  return data.map((row) => row.courses);
};
