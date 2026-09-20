const { describe, it } = require("node:test");
const assert = require("node:assert");

// Helper para mockear Supabase
let semestersData = [];
let coursesData = [];
let gradesData = [];
let daysData = [];
let assessmentsData = [];

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => ({ data: null, error: null }),
    then: (resolve) => {
      if (builder._table === "semester") {
        resolve({ data: semestersData, error: null });
      } else if (builder._table === "course") {
        resolve({ data: coursesData, error: null });
      } else if (builder._table === "grade") {
        resolve({ data: gradesData, error: null });
      } else if (builder._table === "day") {
        resolve({ data: daysData, error: null });
      } else if (builder._table === "assessment") {
        resolve({ data: assessmentsData, error: null });
      } else {
        resolve({ data: [], error: null });
      }
    },
  };
  return builder;
};

const supabaseMock = {
  from: (table) => {
    const b = createQueryBuilder();
    b._table = table;
    return b;
  },
};

require.cache[require.resolve("../src/config/supabase")] = {
  exports: supabaseMock,
};

const reportService = require("../src/services/ReportService");

describe("ReportService - Consolidación de Reportes Académicos", () => {
  it("debe retornar estructura vacía cuando el estudiante no tiene semestres", async () => {
    semestersData = [];

    const result = await reportService.getAcademicTranscript("student-empty");
    assert.strictEqual(result.overallGPA, 0);
    assert.strictEqual(result.totalCreditsEnrolled, 0);
    assert.strictEqual(result.academicStanding, "Sin registros académicos");
    assert.strictEqual(result.semesters.length, 0);
  });

  it("debe calcular adecuadamente el boletín de notas y GPA con semestres y materias evaluadas", async () => {
    semestersData = [
      {
        semester_id: "sem-1",
        name: "2026-1",
        start_date: "2026-02-01",
        end_date: "2026-06-30",
      },
    ];

    coursesData = [
      {
        course_id: "c-1",
        semester_id: "sem-1",
        credits: 4,
        teacher: "Prof. Ramírez",
        color: "#3380FF",
        status: "active",
        courses: { name: "Estructuras de Datos" },
      },
    ];

    // Dos notas del 50% cada una: 4.0 y 5.0 -> Nota final = 4.5
    gradesData = [
      {
        grade_id: "g-1",
        value: 4.0,
        assessment: {
          name: "Parcial 1",
          type: "Parcial",
          percentage: 50,
          due_date: "2026-04-10",
          course_id: "c-1",
        },
      },
      {
        grade_id: "g-2",
        value: 5.0,
        assessment: {
          name: "Parcial 2",
          type: "Parcial",
          percentage: 50,
          due_date: "2026-05-20",
          course_id: "c-1",
        },
      },
    ];

    const result = await reportService.getAcademicTranscript("student-1");
    assert.strictEqual(result.overallGPA, 4.5);
    assert.strictEqual(result.totalCreditsEnrolled, 4);
    assert.strictEqual(result.totalCreditsApproved, 4);
    assert.strictEqual(result.approvalRate, 100);
    assert.strictEqual(result.academicStanding, "Excelente (Matrícula de Honor)");
    assert.strictEqual(result.semesters.length, 1);

    const sem = result.semesters[0];
    assert.strictEqual(sem.semesterAverage, 4.5);
    assert.strictEqual(sem.courses[0].finalGrade, 4.5);
    assert.strictEqual(sem.courses[0].isApproved, true);
  });

  it("debe consolidar horarios y calcular la urgencia de evaluaciones en el cronograma", async () => {
    semestersData = [
      {
        semester_id: "sem-1",
        name: "2026-1",
        start_date: "2026-02-01",
        end_date: "2026-06-30",
      },
    ];

    coursesData = [
      {
        course_id: "c-1",
        credits: 3,
        teacher: "Dra. Gomez",
        color: "#33FF57",
        status: "active",
        courses: { name: "Bases de Datos" },
      },
    ];

    daysData = [
      {
        day_id: "d-1",
        course_id: "c-1",
        day_of_week: "Martes",
        start_time: "08:00",
        end_time: "10:00",
        classroom: "Lab 201",
      },
    ];

    // Fecha a 2 días en el futuro -> urgente
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    const dateStr = futureDate.toISOString().split("T")[0];

    assessmentsData = [
      {
        assessment_id: "a-1",
        name: "Entrega Proyecto",
        type: "Proyecto",
        percentage: 30,
        due_date: dateStr,
        course_id: "c-1",
      },
    ];

    const result = await reportService.getScheduleAndAgenda("student-1");
    assert.strictEqual(result.scheduleSlots.length, 1);
    assert.strictEqual(result.scheduleSlots[0].classroom, "Lab 201");
    assert.strictEqual(result.upcomingAssessments.length, 1);
    assert.strictEqual(result.upcomingAssessments[0].urgency, "urgente");
  });
});
