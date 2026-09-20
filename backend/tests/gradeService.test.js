const { describe, it } = require("node:test");
const assert = require("node:assert");

// Helper para mockear Supabase
let mockQueryData = [];

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    then: (resolve) => {
      resolve({ data: mockQueryData, error: null });
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

const gradeService = require("../src/services/GradeService");

describe("GradeService - Cálculos de Calificaciones y Rendimiento", () => {
  it("debe calcular correctamente la nota actual y porcentaje evaluado de una materia", async () => {
    // Parcial 1: 4.0 (30%), Taller 1: 5.0 (20%) -> Acumulado = (4.0 * 0.3) + (5.0 * 0.2) = 1.2 + 1.0 = 2.2
    mockQueryData = [
      { value: 4.0, assessment: { percentage: 30 } },
      { value: 5.0, assessment: { percentage: 20 } },
    ];

    const result = await gradeService.getCurrentGradeByCourse("c1", "s1");
    assert.strictEqual(result.evaluatedPercentage, 50);
    assert.strictEqual(result.remainingPercentage, 50);
    assert.strictEqual(result.currentGrade, 2.2);
  });

  it("debe retornar 0 si no existen calificaciones registradas en el semestre", async () => {
    mockQueryData = [];

    const result = await gradeService.getSemesterAverage("sem-1", "s1");
    assert.strictEqual(result.semesterAverage, 0);
    assert.strictEqual(result.evaluatedPercentage, 0);
    assert.strictEqual(result.remainingPercentage, 100);
  });

  it("debe calcular adecuadamente el promedio del semestre cuando hay notas completas", async () => {
    // Materia con notas al 100%: 4.5 (50%) y 3.5 (50%) = 2.25 + 1.75 = 4.0
    mockQueryData = [
      { value: 4.5, assessment: { percentage: 50 } },
      { value: 3.5, assessment: { percentage: 50 } },
    ];

    const result = await gradeService.getSemesterAverage("sem-1", "s1");
    assert.strictEqual(result.semesterAverage, 4.0);
    assert.strictEqual(result.evaluatedPercentage, 100);
    assert.strictEqual(result.remainingPercentage, 0);
  });
});
