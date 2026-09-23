const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");

// Helper para mockear Supabase fluent query builder
let mockResponses = {};

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: async () => mockResponses.single ? mockResponses.single() : { data: null, error: null },
    insert: (payload) => {
      builder._lastInsert = payload;
      return builder;
    },
    then: (resolve) => {
      resolve(mockResponses.query ? mockResponses.query() : { data: [], error: null });
    },
  };
  return builder;
};

const supabaseMock = {
  from: (table) => {
    supabaseMock._lastTable = table;
    return createQueryBuilder();
  },
};

require.cache[require.resolve("../src/config/supabase")] = {
  exports: supabaseMock,
};

// Mock CatalogService para checkPrerequisite
const catalogService = require("../src/services/CatalogService");
let originalCheckPrerequisite = catalogService.checkPrerequisite;

const enrollmentService = require("../src/services/EnrollmentService");

describe("EnrollmentService - Matrícula Transaccional", () => {
  beforeEach(() => {
    mockResponses = {};
    catalogService.checkPrerequisite = originalCheckPrerequisite;
  });

  it("debe rechazar la matrícula si no se especifica el semestre", async () => {
    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", null, [{ courses_id: "c1", credits: 3 }]);
      },
      { message: "El ID del semestre es obligatorio" }
    );
  });

  it("debe rechazar la matrícula si el lote de asignaturas está vacío", async () => {
    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", []);
      },
      { message: "Debe seleccionar al menos una asignatura para matricular" }
    );
  });

  it("debe rechazar la matrícula si el semestre no existe o no pertenece al estudiante", async () => {
    mockResponses.single = () => ({ data: null, error: { message: "Not found" } });

    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", [{ courses_id: "c1", credits: 3 }]);
      },
      { message: "El semestre seleccionado no existe o no pertenece al estudiante" }
    );
  });

  it("debe rechazar la matrícula si el total de créditos supera el tope estricto de 26", async () => {
    let callCount = 0;
    mockResponses.single = () => {
      callCount++;
      return { data: { semester_id: "sem-1", name: "2026-1", student_id: "student-1" }, error: null };
    };

    mockResponses.query = () => ({
      data: [{ course_id: "prev-1", credits: 16, courses_id: "p1" }],
      error: null,
    });

    // 16 existentes + 12 solicitados = 28 > 26
    const batch = [
      { courses_id: "new-1", course_name: "Materia A", credits: 6 },
      { courses_id: "new-2", course_name: "Materia B", credits: 6 },
    ];

    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", batch);
      },
      (err) => err.message.includes("supera el límite máximo permitido de 26 créditos semestrales")
    );
  });

  it("debe rechazar la matrícula si alguna asignatura ya está matriculada en el semestre", async () => {
    mockResponses.single = () => ({
      data: { semester_id: "sem-1", name: "2026-1", student_id: "student-1" },
      error: null,
    });

    mockResponses.query = () => ({
      data: [{ course_id: "c1", credits: 4, courses_id: "dup-course-id" }],
      error: null,
    });

    const batch = [
      { courses_id: "dup-course-id", course_name: "Cálculo I", credits: 4 },
    ];

    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", batch);
      },
      (err) => err.message.includes('La materia "Cálculo I" ya se encuentra matriculada')
    );
  });

  it("debe rechazar si una materia no cumple con sus prerrequisitos", async () => {
    mockResponses.single = () => ({
      data: { semester_id: "sem-1", name: "2026-1", student_id: "student-1" },
      error: null,
    });

    mockResponses.query = () => ({ data: [], error: null });

    catalogService.checkPrerequisite = async () => ({
      allowed: false,
      prerequisite: { name: "Programación I" },
    });

    const batch = [
      { courses_id: "c-prog2", course_name: "Programación II", credits: 4 },
    ];

    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", batch);
      },
      (err) => err.message.includes('Debes aprobar previamente "Programación I"')
    );
  });

  it("debe rechazar si hay colisión de horarios entre materias del lote", async () => {
    mockResponses.single = () => ({
      data: { semester_id: "sem-1", name: "2026-1", student_id: "student-1" },
      error: null,
    });

    mockResponses.query = () => ({ data: [], error: null });
    catalogService.checkPrerequisite = async () => ({ allowed: true });

    // Dos materias cruzándose los Lunes (08:00-10:00 y 09:00-11:00)
    const batch = [
      {
        courses_id: "m1",
        course_name: "Física I",
        credits: 3,
        days: [{ day_of_week: "Lunes", start_time: "08:00", end_time: "10:00" }],
      },
      {
        courses_id: "m2",
        course_name: "Álgebra Lineal",
        credits: 3,
        days: [{ day_of_week: "Lunes", start_time: "09:00", end_time: "11:00" }],
      },
    ];

    await assert.rejects(
      async () => {
        await enrollmentService.validateEnrollment("student-1", "sem-1", batch);
      },
      (err) => err.message.includes("Cruce de horario detectado")
    );
  });

  it("debe aceptar y pre-validar exitosamente un lote válido dentro de los 26 créditos", async () => {
    mockResponses.single = () => ({
      data: { semester_id: "sem-1", name: "2026-1", student_id: "student-1" },
      error: null,
    });

    mockResponses.query = () => ({ data: [], error: null });
    catalogService.checkPrerequisite = async () => ({ allowed: true });

    const batch = [
      {
        courses_id: "m1",
        course_name: "Física I",
        credits: 4,
        days: [{ day_of_week: "Lunes", start_time: "08:00", end_time: "10:00" }],
      },
      {
        courses_id: "m2",
        course_name: "Química General",
        credits: 3,
        days: [{ day_of_week: "Martes", start_time: "10:00", end_time: "12:00" }],
      },
    ];

    const result = await enrollmentService.validateEnrollment("student-1", "sem-1", batch);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.totalCredits, 7);
    assert.strictEqual(result.maxCredits, 26);
    assert.strictEqual(result.availableCredits, 19);
  });
});
