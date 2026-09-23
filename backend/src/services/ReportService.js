/**
 * ARCHIVO: ReportService.js
 * PROPÓSITO: Servicio de cálculo y consolidación para los dos reportes del sistema
 *
 * REPORTES:
 * 1. Boletín de Calificaciones y Rendimiento Académico (PPS y GPA Acumulado).
 * 2. Horario Semanal Integrado con Cronograma y Agenda de Evaluaciones.
 */

const supabase = require("../config/supabase");

/**
 * Reporte 1: Boletín de Calificaciones y Rendimiento Académico (GPA)
 */
exports.getAcademicTranscript = async (student_id, filterSemesterId = null) => {
  // 1. Obtener los semestres del estudiante
  let semesterQuery = supabase
    .from("semester")
    .select("semester_id, name, start_date, end_date")
    .eq("student_id", student_id)
    .order("start_date", { ascending: false });

  if (filterSemesterId) {
    semesterQuery = semesterQuery.eq("semester_id", filterSemesterId);
  }

  const { data: semesters, error: semError } = await semesterQuery;
  if (semError) {
    console.error("Error al obtener semestres:", semError);
    throw semError;
  }

  if (!semesters || semesters.length === 0) {
    return {
      overallGPA: 0,
      totalCreditsEnrolled: 0,
      totalCreditsApproved: 0,
      approvalRate: 0,
      academicStanding: "Sin registros académicos",
      semesters: [],
    };
  }

  const semesterIds = semesters.map((s) => s.semester_id);

  // 2. Obtener los cursos de esos semestres
  const { data: courses, error: courseError } = await supabase
    .from("course")
    .select("course_id, semester_id, credits, teacher, color, status, courses!inner(name)")
    .in("semester_id", semesterIds);

  if (courseError) {
    console.error("Error al obtener cursos para reporte:", courseError);
    throw courseError;
  }

  const courseIds = (courses || []).map((c) => c.course_id);

  // 3. Obtener notas y evaluaciones
  let grades = [];
  if (courseIds.length > 0) {
    const { data: gradesData, error: gradeError } = await supabase
      .from("grade")
      .select("grade_id, value, assessment!inner(name, type, percentage, due_date, course_id)")
      .in("assessment.course_id", courseIds);

    if (gradeError) {
      console.error("Error al obtener calificaciones para reporte:", gradeError);
    } else {
      grades = gradesData || [];
    }
  }

  // Mapear notas por course_id
  const gradesByCourse = {};
  grades.forEach((g) => {
    const cId = g.assessment.course_id;
    if (!gradesByCourse[cId]) gradesByCourse[cId] = [];
    gradesByCourse[cId].push({
      grade_id: g.grade_id,
      value: Number(g.value) || 0,
      name: g.assessment.name,
      type: g.assessment.type,
      percentage: Number(g.assessment.percentage) || 0,
      due_date: g.assessment.due_date,
    });
  });

  // 4. Calcular métricas por curso y por semestre
  let cumulativeWeightedGradeSum = 0;
  let cumulativeCreditsSum = 0;
  let totalEnrolledCredits = 0;
  let totalApprovedCredits = 0;
  let totalCoursesApproved = 0;
  let totalCoursesEvaluated = 0;

  const semestersReport = semesters.map((sem) => {
    const semCourses = (courses || []).filter((c) => c.semester_id === sem.semester_id);

    let semWeightedSum = 0;
    let semCreditsSum = 0;
    let semApprovedCredits = 0;

    const detailedCourses = semCourses.map((c) => {
      const courseGrades = gradesByCourse[c.course_id] || [];
      const evaluatedPercentage = courseGrades.reduce((acc, g) => acc + g.percentage, 0);

      // Nota final ponderada
      const finalGrade = courseGrades.reduce(
        (acc, g) => acc + (g.value * g.percentage) / 100,
        0
      );
      const roundedGrade = Math.round(finalGrade * 100) / 100;
      const credits = Number(c.credits) || 0;

      // Estado académico de la asignatura
      const isApproved = roundedGrade >= 3.0;
      let courseStatus = c.status;
      if (evaluatedPercentage >= 100) {
        courseStatus = isApproved ? "completed" : "failed";
      }

      if (isApproved) {
        semApprovedCredits += credits;
        totalApprovedCredits += credits;
        totalCoursesApproved += 1;
      }

      semCreditsSum += credits;
      totalEnrolledCredits += credits;
      totalCoursesEvaluated += 1;

      if (evaluatedPercentage > 0) {
        semWeightedSum += roundedGrade * credits;
        cumulativeWeightedGradeSum += roundedGrade * credits;
        cumulativeCreditsSum += credits;
      }

      return {
        course_id: c.course_id,
        course_name: c.courses?.name || "Sin nombre",
        credits,
        teacher: c.teacher,
        color: c.color,
        status: courseStatus,
        isApproved,
        evaluatedPercentage,
        finalGrade: roundedGrade,
        assessments: courseGrades,
      };
    });

    const semesterAverage =
      semCreditsSum > 0 ? Math.round((semWeightedSum / semCreditsSum) * 100) / 100 : 0;

    return {
      semester_id: sem.semester_id,
      semester_name: sem.name,
      start_date: sem.start_date,
      end_date: sem.end_date,
      semesterAverage,
      totalCredits: semCreditsSum,
      approvedCredits: semApprovedCredits,
      courses: detailedCourses,
    };
  });

  // Promedio Acumulado Histórico (GPA)
  const overallGPA =
    cumulativeCreditsSum > 0
      ? Math.round((cumulativeWeightedGradeSum / cumulativeCreditsSum) * 100) / 100
      : 0;

  const approvalRate =
    totalCoursesEvaluated > 0
      ? Math.round((totalCoursesApproved / totalCoursesEvaluated) * 100)
      : 0;

  let academicStanding = "Normal";
  if (overallGPA >= 4.5) academicStanding = "Excelente (Matrícula de Honor)";
  else if (overallGPA >= 4.0) academicStanding = "Sobresaliente";
  else if (overallGPA >= 3.5) academicStanding = "Bueno";
  else if (overallGPA >= 3.0) academicStanding = "Aceptable";
  else if (overallGPA > 0) academicStanding = "En Riesgo Académico";
  else academicStanding = "Sin Calificaciones";

  return {
    overallGPA,
    totalCreditsEnrolled: totalEnrolledCredits,
    totalCreditsApproved: totalApprovedCredits,
    totalCoursesApproved,
    totalCoursesEvaluated,
    approvalRate,
    academicStanding,
    semesters: semestersReport,
  };
};

/**
 * Reporte 2: Horario Semanal y Cronograma de Actividades / Evaluaciones
 */
exports.getScheduleAndAgenda = async (student_id, filterSemesterId = null) => {
  // 1. Obtener semestre relevante
  let semesterQuery = supabase
    .from("semester")
    .select("semester_id, name, start_date, end_date")
    .eq("student_id", student_id)
    .order("start_date", { ascending: false });

  if (filterSemesterId) {
    semesterQuery = semesterQuery.eq("semester_id", filterSemesterId);
  } else {
    semesterQuery = semesterQuery.limit(1);
  }

  const { data: semesters, error: semError } = await semesterQuery;
  if (semError || !semesters || semesters.length === 0) {
    return {
      semester: null,
      scheduleSlots: [],
      upcomingAssessments: [],
    };
  }

  const currentSemester = semesters[0];

  // 2. Obtener materias activas en el semestre
  const { data: courses, error: courseError } = await supabase
    .from("course")
    .select("course_id, credits, teacher, color, status, courses!inner(name)")
    .eq("semester_id", currentSemester.semester_id)
    .eq("status", "active");

  if (courseError) {
    console.error("Error al obtener materias activas:", courseError);
    throw courseError;
  }

  const courseIds = (courses || []).map((c) => c.course_id);

  if (courseIds.length === 0) {
    return {
      semester: currentSemester,
      scheduleSlots: [],
      upcomingAssessments: [],
    };
  }

  // 3. Obtener horarios (tabla 'day')
  const { data: daysData, error: daysError } = await supabase
    .from("day")
    .select("day_id, course_id, day_of_week, start_time, end_time, classroom")
    .in("course_id", courseIds);

  if (daysError) {
    console.error("Error al obtener franjas de horario:", daysError);
  }

  const coursesMap = {};
  (courses || []).forEach((c) => {
    coursesMap[c.course_id] = c;
  });

  const scheduleSlots = (daysData || []).map((d) => {
    const parentCourse = coursesMap[d.course_id] || {};
    return {
      day_id: d.day_id,
      course_id: d.course_id,
      course_name: parentCourse.courses?.name || "Sin Asignatura",
      teacher: parentCourse.teacher || "Por asignar",
      color: parentCourse.color || "#3380FF",
      day_of_week: d.day_of_week,
      start_time: d.start_time,
      end_time: d.end_time,
      classroom: d.classroom || "Aula General",
    };
  });

  // 4. Obtener próximas evaluaciones ordenadas por due_date
  const { data: assessmentsData, error: assError } = await supabase
    .from("assessment")
    .select("assessment_id, name, type, percentage, due_date, course_id")
    .in("course_id", courseIds)
    .order("due_date", { ascending: true });

  if (assError) {
    console.error("Error al obtener evaluaciones para cronograma:", assError);
  }

  const now = new Date();
  const upcomingAssessments = (assessmentsData || []).map((a) => {
    const parentCourse = coursesMap[a.course_id] || {};
    const dueDate = a.due_date ? new Date(a.due_date) : null;

    let daysRemaining = null;
    let urgency = "normal";

    if (dueDate) {
      const diffTime = dueDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (daysRemaining < 0) {
        urgency = "finalizado";
      } else if (daysRemaining <= 3) {
        urgency = "urgente";
      } else if (daysRemaining <= 7) {
        urgency = "proximo";
      } else {
        urgency = "normal";
      }
    }

    return {
      assessment_id: a.assessment_id,
      name: a.name,
      type: a.type,
      percentage: a.percentage,
      due_date: a.due_date,
      daysRemaining,
      urgency,
      course_name: parentCourse.courses?.name || "Asignatura",
      color: parentCourse.color || "#3380FF",
    };
  });

  return {
    semester: currentSemester,
    scheduleSlots,
    upcomingAssessments,
  };
};
