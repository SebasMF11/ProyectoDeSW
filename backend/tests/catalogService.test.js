const { describe, it } = require("node:test");
const assert = require("node:assert");

// Helper para mockear Supabase
let singleData = null;
let queryData = [];

const createQueryBuilder = () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    limit: () => builder,
    single: async () => ({ data: singleData, error: null }),
    then: (resolve) => {
      resolve({ data: queryData, error: null });
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

const catalogService = require("../src/services/CatalogService");
const adminMiddleware = require("../src/middlewares/adminMiddleware");

describe("CatalogService & RBAC - Catálogo Universitario", () => {
  it("debe permitir inscripción si la materia no tiene prerrequisitos definidos", async () => {
    singleData = { prerequisito: null };

    const check = await catalogService.checkPrerequisite("student-1", "course-intro");
    assert.strictEqual(check.allowed, true);
    assert.strictEqual(check.prerequisite, null);
  });

  it("adminMiddleware debe rechazar con 403 Forbidden a estudiantes regulares", () => {
    let statusCode = null;
    let jsonBody = null;

    const req = {
      student: {
        id: "student-1",
        email: "student@poli.edu",
        user_metadata: { role: "student" },
      },
    };

    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            jsonBody = body;
          },
        };
      },
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    adminMiddleware(req, res, next);

    assert.strictEqual(statusCode, 403);
    assert.ok(jsonBody.error.includes("se requieren permisos de administrador"));
    assert.strictEqual(nextCalled, false);
  });

  it("adminMiddleware debe rechazar con 401 si no hay usuario autenticado", () => {
    let statusCode = null;
    let jsonBody = null;

    const req = {};
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => {
            jsonBody = body;
          },
        };
      },
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    adminMiddleware(req, res, next);

    assert.strictEqual(statusCode, 401);
    assert.strictEqual(nextCalled, false);
  });

  it("adminMiddleware debe permitir el paso si el usuario posee rol 'admin'", () => {
    const req = {
      student: {
        id: "admin-1",
        email: "admin@poli.edu",
        user_metadata: { role: "admin" },
      },
    };

    let nextCalled = false;
    const next = () => { nextCalled = true; };

    adminMiddleware(req, {}, next);

    assert.strictEqual(nextCalled, true);
  });
});
