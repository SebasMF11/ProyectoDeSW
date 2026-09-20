const { describe, it } = require("node:test");
const assert = require("node:assert");

let assessmentMockData = [];
let singleAssessmentData = null;

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    neq: () => builder,
    gte: () => builder,
    lte: () => builder,
    lt: () => builder,
    limit: () => builder,
    insert: (rows) => {
      assessmentMockData = rows;
      return builder;
    },
    update: (fields) => {
      assessmentMockData = [fields];
      return builder;
    },
    delete: () => builder,
    single: async () => ({ data: singleAssessmentData, error: null }),
    then: (resolve) => {
      resolve({ data: assessmentMockData, error: null });
    },
  };
  return builder;
};

const supabaseMock = {
  from: () => createQueryBuilder(),
};

require.cache[require.resolve("../src/config/supabase")] = {
  exports: supabaseMock,
};

const assessmentService = require("../src/services/AssessmentService");

describe("AssessmentService - Evaluaciones y Rúbricas (Pantalla Maestra 3)", () => {
  it("debe crear una nueva evaluación con su ponderación", async () => {
    const newAssessment = {
      course_id: "c-100",
      name: "Parcial 1",
      type: "Examen",
      percentage: 30,
      due_date: "2026-04-15T10:00:00Z",
    };

    const result = await assessmentService.create(newAssessment);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "Parcial 1");
    assert.strictEqual(result[0].percentage, 30);
  });

  it("debe detectar conflicto de evaluaciones si ya existe una en la misma fecha", async () => {
    assessmentMockData = [
      {
        assessment_id: "a-1",
        course_id: "c-100",
        name: "Quiz 1",
        due_date: "2026-04-15T09:00:00Z",
      },
    ];

    const conflicts = await assessmentService.checkAssessmentConflict(
      "c-100",
      "2026-04-15T14:00:00Z"
    );
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].name, "Quiz 1");
  });

  it("debe calcular correctamente el porcentaje acumulado de evaluaciones", async () => {
    assessmentMockData = [
      { percentage: 25 },
      { percentage: 35 },
      { percentage: 20 },
    ];

    const assessments = await assessmentService.getTotalPercentage("c-100");
    const total = assessments.reduce((acc, curr) => acc + curr.percentage, 0);
    assert.strictEqual(total, 80);
  });

  it("debe listar las evaluaciones asociadas a un curso", async () => {
    assessmentMockData = [
      { assessment_id: "a-1", name: "Taller 1", percentage: 15 },
      { assessment_id: "a-2", name: "Proyecto Final", percentage: 40 },
    ];

    const result = await assessmentService.getByCourse("c-100", "s-1");
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[1].name, "Proyecto Final");
  });

  it("debe actualizar una evaluación perteneciente al estudiante", async () => {
    singleAssessmentData = {
      assessment_id: "a-1",
      course: { status: "active", semester: { student_id: "s-1" } },
    };
    const updateFields = { name: "Parcial Reprogramado", percentage: 35 };

    const result = await assessmentService.update("a-1", "s-1", updateFields);
    assert.strictEqual(result[0].name, "Parcial Reprogramado");
    assert.strictEqual(result[0].percentage, 35);
  });

  it("debe eliminar una evaluación y sus notas asociadas en cascada", async () => {
    singleAssessmentData = {
      assessment_id: "a-1",
      course: { semester: { student_id: "s-1" } },
    };

    const deleted = await assessmentService.delete("a-1", "s-1");
    assert.strictEqual(deleted, true);
  });
});
