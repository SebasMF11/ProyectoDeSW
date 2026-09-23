const { describe, it } = require("node:test");
const assert = require("node:assert");

let courseMockData = [];
let singleCourseData = null;

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    in: () => builder,
    insert: (rows) => {
      courseMockData = rows;
      return builder;
    },
    update: (fields) => {
      courseMockData = [fields];
      return builder;
    },
    delete: () => builder,
    single: async () => ({ data: singleCourseData, error: null }),
    then: (resolve) => {
      resolve({ data: courseMockData, error: null });
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

const courseService = require("../src/services/CourseService");

describe("CourseService - Gestión de Cursos (Pantalla Maestra 2)", () => {
  it("debe listar todas las asignaturas activas del estudiante", async () => {
    courseMockData = [
      { course_id: "c-1", teacher: "Ing. Perez", credits: 4, color: "#3380FF" },
      { course_id: "c-2", teacher: "Dra. Gomez", credits: 3, color: "#33FF57" },
    ];

    const result = await courseService.getAll("s1");
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].teacher, "Ing. Perez");
    assert.strictEqual(result[1].teacher, "Dra. Gomez");
  });

  it("debe obtener asignaturas filtradas por semestre", async () => {
    courseMockData = [
      { course_id: "c-1", teacher: "Ing. Perez", credits: 4, color: "#3380FF" },
    ];

    const result = await courseService.getBySemester("sem-1");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].course_id, "c-1");
  });

  it("debe crear una nueva asignatura en el semestre", async () => {
    const newCourse = {
      courses_id: "cat-1",
      teacher: "Prof. Lopez",
      credits: 4,
      color: "#FF5733",
      status: "active",
      semester_id: "sem-1",
    };

    const result = await courseService.create(newCourse);
    assert.strictEqual(result[0].teacher, "Prof. Lopez");
    assert.strictEqual(result[0].credits, 4);
  });

  it("debe actualizar los datos de una asignatura activa", async () => {
    singleCourseData = { course_id: "c-1" };
    const fields = { teacher: "Nuevo Profesor", credits: 5 };

    const result = await courseService.updateCourse("c-1", "s1", fields);
    assert.strictEqual(result[0].teacher, "Nuevo Profesor");
    assert.strictEqual(result[0].credits, 5);
  });

  it("debe actualizar el estado de un curso (ej: a completed)", async () => {
    singleCourseData = { course_id: "c-1" };
    const result = await courseService.updateStatus("c-1", "s1", "completed");
    assert.strictEqual(result[0].status, "completed");
  });

  it("debe eliminar un curso y sus dependencias asociadas en cascada", async () => {
    singleCourseData = { course_id: "c-1" };
    const result = await courseService.deleteCourse("c-1", "s1");
    assert.strictEqual(result, true);
  });
});
