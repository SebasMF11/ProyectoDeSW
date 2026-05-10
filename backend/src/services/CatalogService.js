const supabase = require("../config/supabase");

// ── Careers ──────────────────────────────────────────────────────────────────

/**
 * Retorna las materias disponibles para que un estudiante agregue a su horario.
 *
 * Lógica de filtrado:
 * 1. Solo materias que pertenecen a la carrera del estudiante (courses_per_career).
 * 2. Excluye materias que el estudiante ya tiene con status 'active' o 'completed'.
 *    (puede volver a cursar las que tiene 'failed' o 'inactive').
 * 3. Incluye el prerequisito resuelto (nombre) para que el frontend pueda mostrarlo.
 *
 * @param {string} student_id  - UUID del estudiante autenticado
 * @param {string|null} faculty_id - Filtrar por facultad (opcional)
 */
exports.getAvailableCoursesForStudent = async (student_id, faculty_id = null) => {
  // 1. Obtener career_id del estudiante
  const { data: studentData, error: studentError } = await supabase
    .from("student")
    .select("career_id")
    .eq("student_id", student_id)
    .single();

  if (studentError || !studentData?.career_id) {
    throw new Error("No se pudo obtener la carrera del estudiante");
  }

  const career_id = studentData.career_id;

  // 2. Intentar obtener materias de la carrera del estudiante via courses_per_career
  let catalogQuery = supabase
    .from("courses_per_career")
    .select(
      "courses!inner(courses_id, name, faculty(faculty_id, name), prerequisito, prerequisite_course:courses!prerequisito(courses_id, name))"
    )
    .eq("career_id", career_id);

  if (faculty_id) {
    catalogQuery = catalogQuery.eq("courses.faculty_id", faculty_id);
  }

  const { data: careerCourses, error: careerError } = await catalogQuery;

  if (careerError) {
    console.error(careerError);
    throw careerError;
  }

  let allCatalogCourses = careerCourses.map((row) => row.courses);

  // Fallback: si courses_per_career no tiene datos para esta carrera,
  // usar todas las materias del catálogo (filtradas por facultad si aplica)
  if (allCatalogCourses.length === 0) {
    let fallbackQuery = supabase
      .from("courses")
      .select("courses_id, name, faculty(faculty_id, name), prerequisito")
      .order("name");

    if (faculty_id) {
      fallbackQuery = fallbackQuery.eq("faculty_id", faculty_id);
    }

    const { data: allCourses, error: allError } = await fallbackQuery;

    if (allError) {
      console.error(allError);
      throw allError;
    }

    allCatalogCourses = allCourses || [];
  }

  // 3. Obtener los courses_id que el estudiante ya tiene con status active o completed
  const { data: enrolledCourses, error: enrolledError } = await supabase
    .from("course")
    .select("courses_id, status, semester!inner(student_id)")
    .eq("semester.student_id", student_id)
    .in("status", ["active", "completed"]);

  if (enrolledError) {
    console.error(enrolledError);
    throw enrolledError;
  }

  const blockedIds = new Set((enrolledCourses || []).map((c) => c.courses_id));

  // 4. Filtrar: excluir las materias bloqueadas
  const available = allCatalogCourses.filter(
    (c) => !blockedIds.has(c.courses_id)
  );

  // 5. Resolver nombres de prerequisitos con un query separado
  //    (el join self-referencial de Supabase no es confiable para este caso)
  const prereqIds = [...new Set(
    available.filter((c) => c.prerequisito).map((c) => c.prerequisito)
  )];

  let prereqMap = {};
  if (prereqIds.length > 0) {
    const { data: prereqCourses } = await supabase
      .from("courses")
      .select("courses_id, name")
      .in("courses_id", prereqIds);

    if (prereqCourses) {
      prereqMap = Object.fromEntries(prereqCourses.map((p) => [p.courses_id, p]));
    }
  }

  // Adjuntar prerequisite_course resuelto a cada materia
  const result = available.map((c) => ({
    ...c,
    prerequisite_course: c.prerequisito ? (prereqMap[c.prerequisito] ?? null) : null,
  }));

  return result;
};

/**
 * Verifica si el estudiante cumple el prerequisito de una materia.
 * Retorna true si la materia no tiene prerequisito o si el estudiante
 * ya la tiene con status 'completed'.
 *
 * @param {string} student_id
 * @param {string} courses_id - La materia que se quiere agregar
 */
exports.checkPrerequisite = async (student_id, courses_id) => {
  // Obtener el prerequisito de la materia
  const { data: catalogCourse, error: catalogError } = await supabase
    .from("courses")
    .select("prerequisito")
    .eq("courses_id", courses_id)
    .single();

  if (catalogError || !catalogCourse) {
    throw new Error("Materia no encontrada en el catálogo");
  }

  // Sin prerequisito → siempre permitido
  if (!catalogCourse.prerequisito) {
    return { allowed: true, prerequisite: null };
  }

  const prereqId = catalogCourse.prerequisito;

  // Obtener nombre del prerequisito
  const { data: prereqData } = await supabase
    .from("courses")
    .select("courses_id, name")
    .eq("courses_id", prereqId)
    .single();

  const prereqName = prereqData?.name || prereqId;

  // Verificar si el estudiante tiene el prerequisito completado
  const { data: completedPrereq, error: prereqError } = await supabase
    .from("course")
    .select("course_id, status, semester!inner(student_id)")
    .eq("courses_id", prereqId)
    .eq("semester.student_id", student_id)
    .eq("status", "completed")
    .limit(1);

  if (prereqError) {
    console.error(prereqError);
    throw prereqError;
  }

  const fulfilled = completedPrereq && completedPrereq.length > 0;

  return {
    allowed: fulfilled,
    prerequisite: { courses_id: prereqId, name: prereqName },
  };
};

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
