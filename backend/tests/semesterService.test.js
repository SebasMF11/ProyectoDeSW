const { describe, it } = require("node:test");
const assert = require("node:assert");

let mockData = [];

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    lt: () => builder,
    gt: () => builder,
    insert: (rows) => {
      mockData = rows;
      return builder;
    },
    update: (fields) => {
      mockData = [fields];
      return builder;
    },
    then: (resolve) => {
      resolve({ data: mockData, error: null });
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

const semesterService = require("../src/services/SemesterService");

describe("SemesterService - Gestión de Semestres (Pantalla Maestra 1)", () => {
  it("debe listar todos los semestres pertenecientes al estudiante", async () => {
    mockData = [
      { semester_id: "sem-1", name: "2025-2", student_id: "s1" },
      { semester_id: "sem-2", name: "2026-1", student_id: "s1" },
    ];

    const result = await semesterService.getAll("s1");
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].name, "2025-2");
    assert.strictEqual(result[1].name, "2026-1");
  });

  it("debe crear un nuevo semestre correctamente", async () => {
    const newSem = {
      name: "2026-2",
      start_date: "2026-08-01",
      end_date: "2026-12-15",
      student_id: "s1",
    };

    const result = await semesterService.create(newSem);
    assert.strictEqual(result[0].name, "2026-2");
    assert.strictEqual(result[0].student_id, "s1");
  });

  it("debe actualizar campos de un semestre existente", async () => {
    const updates = { name: "2026-2 (Modificado)" };
    const result = await semesterService.update("sem-1", "s1", updates);
    assert.strictEqual(result[0].name, "2026-2 (Modificado)");
  });

  it("debe consultar solapamiento de fechas con semestres existentes", async () => {
    mockData = [{ semester_id: "sem-overlap", name: "2026-1" }];

    const result = await semesterService.checkOverlap(
      "2026-02-01",
      "2026-06-30",
      "s1"
    );
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "2026-1");
  });
});
