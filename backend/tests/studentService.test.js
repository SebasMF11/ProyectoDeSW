const { describe, it } = require("node:test");
const assert = require("node:assert");

let studentMockData = [];
let singleStudentData = null;
let authSignUpData = null;
let authSignInData = null;

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    limit: () => builder,
    insert: (row) => {
      studentMockData = Array.isArray(row) ? row : [row];
      return builder;
    },
    update: (fields) => {
      studentMockData = [fields];
      return builder;
    },
    single: async () => ({ data: singleStudentData, error: null }),
    then: (resolve) => {
      resolve({ data: studentMockData, error: null });
    },
  };
  return builder;
};

const supabaseMock = {
  from: () => createQueryBuilder(),
  auth: {
    signUp: async (params) => ({ data: authSignUpData || { user: { id: "u-new" } }, error: null }),
    signInWithPassword: async (params) => ({
      data: authSignInData || {
        user: {
          id: "u-1",
          email: "student@epn.edu.ec",
          user_metadata: { name: "Estudiante", lastName: "Poli", career_id: "car-1" },
        },
      },
      error: null,
    }),
    updateUser: async (params) => ({ data: { user: { id: "u-1" } }, error: null }),
  },
};

require.cache[require.resolve("../src/config/supabase")] = {
  exports: supabaseMock,
};

const studentService = require("../src/services/StudentService");

describe("StudentService - Perfil y Autenticación de Estudiantes", () => {
  it("debe registrar un nuevo estudiante con sus metadatos y carrera", async () => {
    authSignUpData = {
      user: {
        id: "u-123",
        email: "nuevo@epn.edu.ec",
        user_metadata: { name: "Carlos", lastName: "Mora", career_id: "car-1" },
      },
    };

    const res = await studentService.authStudent({
      name: "Carlos",
      lastName: "Mora",
      email: "nuevo@epn.edu.ec",
      password: "SecretPassword123!",
      career_id: "car-1",
    });

    assert.strictEqual(res.user.id, "u-123");
    assert.strictEqual(res.user.email, "nuevo@epn.edu.ec");
  });

  it("debe iniciar sesión y sincronizar perfil existente", async () => {
    studentMockData = [{ student_id: "u-1", name: "Estudiante" }];
    authSignInData = {
      user: {
        id: "u-1",
        email: "student@epn.edu.ec",
        user_metadata: { name: "Estudiante", lastName: "Poli", career_id: "car-1" },
      },
    };

    const res = await studentService.loginStudent({
      email: "student@epn.edu.ec",
      password: "MyPassword!",
    });

    assert.strictEqual(res.user.id, "u-1");
  });

  it("debe obtener el perfil del estudiante junto a su carrera", async () => {
    singleStudentData = {
      student_id: "u-1",
      name: "Ana",
      last_name: "Gomez",
      email: "ana@epn.edu.ec",
      career: { name: "Ingeniería de Software" },
    };

    const student = await studentService.getStudent("u-1");
    assert.strictEqual(student.name, "Ana");
    assert.strictEqual(student.career.name, "Ingeniería de Software");
  });

  it("debe actualizar la información del perfil del estudiante", async () => {
    studentMockData = [{ student_id: "u-1", name: "Ana Maria", last_name: "Gomez" }];

    const updated = await studentService.updateStudent("u-1", {
      name: "Ana Maria",
    });
    assert.strictEqual(updated[0].name, "Ana Maria");
  });
});
