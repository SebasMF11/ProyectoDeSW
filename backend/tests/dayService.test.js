const { describe, it } = require("node:test");
const assert = require("node:assert");

let dayMockData = [];
let singleDayData = null;

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    lt: () => builder,
    gt: () => builder,
    insert: (rows) => {
      dayMockData = rows;
      return builder;
    },
    update: (fields) => {
      dayMockData = [fields];
      return builder;
    },
    delete: () => builder,
    single: async () => ({ data: singleDayData, error: null }),
    then: (resolve) => {
      resolve({ data: dayMockData, error: null });
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

const dayService = require("../src/services/DayService");

describe("DayService - Horarios y Días de Clase (Pantalla Maestra 4)", () => {
  it("debe listar todos los bloques de horario de un curso", async () => {
    dayMockData = [
      {
        day_id: "d-1",
        day_of_week: "Monday",
        start_time: "07:00:00",
        end_time: "09:00:00",
        classroom: "Lab 301",
        course: { semester: { student_id: "s-1" } },
      },
      {
        day_id: "d-2",
        day_of_week: "Wednesday",
        start_time: "07:00:00",
        end_time: "09:00:00",
        classroom: "Lab 301",
        course: { semester: { student_id: "s-1" } },
      },
    ];

    const result = await dayService.getAll("c-1", "s-1");
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].day_of_week, "Monday");
    assert.strictEqual(result[0].classroom, "Lab 301");
  });

  it("debe crear un nuevo bloque de clase asociado a un curso del estudiante", async () => {
    singleDayData = { course_id: "c-1", semester: { student_id: "s-1" } };
    const newDay = {
      course_id: "c-1",
      day_of_week: "Friday",
      start_time: "10:00:00",
      end_time: "12:00:00",
      classroom: "Aula B2",
    };

    const result = await dayService.create(newDay, "s-1");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].day_of_week, "Friday");
    assert.strictEqual(result[0].classroom, "Aula B2");
  });

  it("debe rechazar la creación de horario si el curso no pertenece al estudiante", async () => {
    singleDayData = null; // Curso no encontrado o ajeno
    const newDay = {
      course_id: "c-other",
      day_of_week: "Friday",
      start_time: "10:00:00",
      end_time: "12:00:00",
    };

    const result = await dayService.create(newDay, "s-1");
    assert.strictEqual(result, null);
  });

  it("debe detectar conflictos de solapamiento horario en el mismo día", async () => {
    dayMockData = [
      {
        day_id: "d-existing",
        day_of_week: "Tuesday",
        start_time: "08:00:00",
        end_time: "10:00:00",
      },
    ];

    const conflicts = await dayService.checkConflict(
      "Tuesday",
      "09:00:00",
      "11:00:00",
      "s-1"
    );
    assert.strictEqual(conflicts.length, 1);
    assert.strictEqual(conflicts[0].day_id, "d-existing");
  });

  it("debe actualizar un bloque de horario existente", async () => {
    singleDayData = {
      day_id: "d-1",
      course: { semester: { student_id: "s-1" } },
    };
    const updateFields = { classroom: "Auditorio Principal" };

    const result = await dayService.update("d-1", "s-1", updateFields);
    assert.strictEqual(result[0].classroom, "Auditorio Principal");
  });

  it("debe eliminar un bloque de horario existente", async () => {
    singleDayData = {
      day_id: "d-1",
      course: { semester: { student_id: "s-1" } },
    };

    const deleted = await dayService.delete("d-1", "s-1");
    assert.strictEqual(deleted, true);
  });
});
