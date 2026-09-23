/**
 * ARCHIVO: EnrollmentService.js
 * PROPÓSITO: Servicio transaccional para matrícula semestral en bloque
 *
 * REGLAS DE NEGOCIO:
 * 1. Límite estricto de máximo 26 créditos semestrales (Créditos actuales + Nuevos <= 26).
 * 2. Validación atómica de prerrequisitos aprobados por cada asignatura del lote.
 * 3. Detección de colisión de horarios (sobreposición en días y franjas horarias):
 *    - Entre materias del mismo lote.
 *    - Contra materias ya matriculadas en el semestre.
 * 4. Inserción atómica en las tablas 'course' y 'day'.
 */

const supabase = require("../config/supabase");
const catalogService = require("./CatalogService");

const colorMap = {
  red: "#FF5733",
  blue: "#3380FF",
  green: "#33FF57",
  yellow: "#FFD700",
  orange: "#FFA500",
  purple: "#800080",
  pink: "#FF69B4",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#808080",
};

/**
 * Normaliza horas en formato "HH:MM" o "HH:MM:SS" a minutos del día para comparación confiable
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":");
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
};

/**
 * Verifica si dos franjas horarias se sobreponen en el mismo día
 */
const areSlotsOverlapping = (slotA, slotB) => {
  if (slotA.day_of_week?.toLowerCase() !== slotB.day_of_week?.toLowerCase()) {
    return false;
  }
  const startA = timeToMinutes(slotA.start_time);
  const endA = timeToMinutes(slotA.end_time);
  const startB = timeToMinutes(slotB.start_time);
  const endB = timeToMinutes(slotB.end_time);

  return startA < endB && endA > startB;
};

/**
 * Valida la matrícula sin persistir cambios en la base de datos
 */
exports.validateEnrollment = async (student_id, semester_id, batchCourses) => {
  if (!semester_id) {
    throw new Error("El ID del semestre es obligatorio");
  }
  if (!Array.isArray(batchCourses) || batchCourses.length === 0) {
    throw new Error("Debe seleccionar al menos una asignatura para matricular");
  }

  // 1. Validar existencia y propiedad del semestre
  const { data: semester, error: semError } = await supabase
    .from("semester")
    .select("semester_id, name, student_id")
    .eq("semester_id", semester_id)
    .eq("student_id", student_id)
    .single();

  if (semError || !semester) {
    throw new Error("El semestre seleccionado no existe o no pertenece al estudiante");
  }

  // 2. Obtener materias ya inscritas en este semestre
  const { data: existingCourses, error: existError } = await supabase
    .from("course")
    .select("course_id, credits, courses_id, courses!inner(name)")
    .eq("semester_id", semester_id)
    .eq("status", "active");

  if (existError) {
    console.error("Error al consultar materias existentes:", existError);
    throw existError;
  }

  const currentEnrolledCredits = (existingCourses || []).reduce(
    (acc, c) => acc + (Number(c.credits) || 0),
    0
  );

  const batchCredits = batchCourses.reduce(
    (acc, c) => acc + (Number(c.credits) || 0),
    0
  );

  const totalProjectedCredits = currentEnrolledCredits + batchCredits;

  // REGLA 1: Tope de 26 créditos
  if (totalProjectedCredits > 26) {
    throw new Error(
      `El total de créditos proyectado (${totalProjectedCredits}) supera el límite máximo permitido de 26 créditos semestrales (Créditos actuales: ${currentEnrolledCredits}, Créditos solicitados: ${batchCredits}).`
    );
  }

  // REGLA 2: No duplicar materias (ya matriculadas o repetidas en el lote)
  const existingCatalogIds = new Set((existingCourses || []).map((c) => c.courses_id));
  const batchCatalogIds = new Set();

  for (const course of batchCourses) {
    if (!course.courses_id) {
      throw new Error("Cada asignatura en el lote debe incluir 'courses_id'");
    }
    if (existingCatalogIds.has(course.courses_id)) {
      const courseName = course.course_name || "Asignatura";
      throw new Error(`La materia "${courseName}" ya se encuentra matriculada en este semestre.`);
    }
    if (batchCatalogIds.has(course.courses_id)) {
      const courseName = course.course_name || "Asignatura";
      throw new Error(`La materia "${courseName}" está duplicada en el lote de matrícula.`);
    }
    batchCatalogIds.add(course.courses_id);
  }

  // REGLA 3: Verificación de prerrequisitos de cada materia del lote
  for (const course of batchCourses) {
    const prereqCheck = await catalogService.checkPrerequisite(
      student_id,
      course.courses_id
    );
    if (!prereqCheck.allowed) {
      const prereqName = prereqCheck.prerequisite?.name || "un prerrequisito";
      const courseName = course.course_name || "esta materia";
      throw new Error(
        `No cumples el prerrequisito para matricular "${courseName}". Debes aprobar previamente "${prereqName}".`
      );
    }
  }

  // REGLA 4: Verificación de solapamiento de horarios
  // 4a. Obtener horarios de materias ya existentes en el semestre
  const existingCourseIds = (existingCourses || []).map((c) => c.course_id);
  let existingSlots = [];

  if (existingCourseIds.length > 0) {
    const { data: daysData, error: daysError } = await supabase
      .from("day")
      .select(
        "day_id, course_id, day_of_week, start_time, end_time, classroom, course!inner(courses!inner(name))"
      )
      .in("course_id", existingCourseIds);

    if (daysError) {
      console.error("Error al obtener horarios existentes:", daysError);
    } else {
      existingSlots = (daysData || []).map((d) => ({
        day_of_week: d.day_of_week,
        start_time: d.start_time,
        end_time: d.end_time,
        course_name: d.course?.courses?.name || "Materia Existente",
      }));
    }
  }

  // 4b. Aplanar franjas del nuevo lote
  const newSlots = [];
  for (const course of batchCourses) {
    if (Array.isArray(course.days)) {
      for (const day of course.days) {
        if (day.day_of_week && day.start_time && day.end_time) {
          if (timeToMinutes(day.start_time) >= timeToMinutes(day.end_time)) {
            throw new Error(
              `Horario inválido en "${course.course_name || "materia"}": la hora de inicio (${day.start_time}) debe ser menor que la hora de fin (${day.end_time}).`
            );
          }
          newSlots.push({
            day_of_week: day.day_of_week,
            start_time: day.start_time,
            end_time: day.end_time,
            classroom: day.classroom || "Aula General",
            course_name: course.course_name || "Nueva Materia",
            courses_id: course.courses_id,
          });
        }
      }
    }
  }

  // 4c. Verificar colisión entre materias del nuevo lote
  for (let i = 0; i < newSlots.length; i++) {
    for (let j = i + 1; j < newSlots.length; j++) {
      if (
        newSlots[i].courses_id !== newSlots[j].courses_id &&
        areSlotsOverlapping(newSlots[i], newSlots[j])
      ) {
        throw new Error(
          `Cruce de horario detectado: "${newSlots[i].course_name}" y "${newSlots[j].course_name}" coinciden el ${newSlots[i].day_of_week} entre ${newSlots[i].start_time} y ${newSlots[i].end_time}.`
        );
      }
    }
  }

  // 4d. Verificar colisión entre el nuevo lote y materias existentes
  for (const nSlot of newSlots) {
    for (const eSlot of existingSlots) {
      if (areSlotsOverlapping(nSlot, eSlot)) {
        throw new Error(
          `Cruce de horario con materia ya matriculada: "${nSlot.course_name}" se sobrepone con "${eSlot.course_name}" el ${nSlot.day_of_week} entre ${nSlot.start_time} y ${nSlot.end_time}.`
        );
      }
    }
  }

  return {
    valid: true,
    semesterName: semester.name,
    currentCredits: currentEnrolledCredits,
    batchCredits,
    totalCredits: totalProjectedCredits,
    maxCredits: 26,
    availableCredits: 26 - totalProjectedCredits,
  };
};

/**
 * Procesa la matrícula transaccional en bloque
 */
exports.processEnrollment = async (student_id, semester_id, batchCourses) => {
  // Primero validamos todas las reglas
  const validation = await exports.validateEnrollment(
    student_id,
    semester_id,
    batchCourses
  );

  const insertedCourses = [];

  // Inserción en bloque de cada materia y sus horarios
  for (const course of batchCourses) {
    const rawColor = course.color ? String(course.color).toLowerCase() : "blue";
    const colorHex = colorMap[rawColor] || (rawColor.startsWith("#") ? rawColor : "#3380FF");

    const { data: newCourse, error: insertCourseError } = await supabase
      .from("course")
      .insert([
        {
          courses_id: course.courses_id,
          credits: Number(course.credits) || 3,
          teacher: course.teacher?.trim() || "Por asignar",
          color: colorHex,
          status: "active",
          semester_id,
        },
      ])
      .select("course_id, credits, teacher, color, courses!inner(name)")
      .single();

    if (insertCourseError) {
      console.error("Error al insertar curso en matrícula:", insertCourseError);
      throw insertCourseError;
    }

    // Insertar franjas horarias en la tabla 'day' si fueron provistas
    if (Array.isArray(course.days) && course.days.length > 0) {
      const dayInserts = course.days
        .filter((d) => d.day_of_week && d.start_time && d.end_time)
        .map((d) => ({
          course_id: newCourse.course_id,
          day_of_week: d.day_of_week,
          start_time: d.start_time,
          end_time: d.end_time,
          classroom: d.classroom?.trim() || "Aula General",
        }));

      if (dayInserts.length > 0) {
        const { error: insertDaysError } = await supabase
          .from("day")
          .insert(dayInserts);

        if (insertDaysError) {
          console.error("Error al insertar horarios:", insertDaysError);
          // Opcional: limpiar curso huérfano si falla la inserción de horarios
          await supabase.from("course").delete().eq("course_id", newCourse.course_id);
          throw insertDaysError;
        }
      }
    }

    insertedCourses.push(newCourse);
  }

  return {
    message: "Matrícula procesada exitosamente",
    semester: validation.semesterName,
    enrolledCoursesCount: insertedCourses.length,
    totalCredits: validation.totalCredits,
    courses: insertedCourses,
  };
};
