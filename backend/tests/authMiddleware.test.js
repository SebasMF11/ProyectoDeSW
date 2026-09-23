const { describe, it } = require("node:test");
const assert = require("node:assert");

let getUserResult = { data: null, error: null };
let shouldThrowNetworkError = false;

const supabaseMock = {
  from: () => ({}),
  auth: {
    getUser: async (token) => {
      if (shouldThrowNetworkError) {
        throw new Error("Network offline");
      }
      return getUserResult;
    },
  },
};

require.cache[require.resolve("../src/config/supabase")] = {
  exports: supabaseMock,
};

const authMiddleware = require("../src/middlewares/authMiddleware");

// Helper para crear tokens JWT falsos pero con formato y payload válido
const createTestJwt = (payload) => {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = "fake_sig";
  return `${header}.${body}.${signature}`;
};

describe("authMiddleware - Seguridad y Autenticación JWT", () => {
  it("debe rechazar con 401 si no se envía header Authorization", async () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (body) => {
            jsonSent = body;
          },
        };
      },
    };
    let nextCalled = false;
    const next = () => {
      nextCalled = true;
    };

    await authMiddleware(req, res, next);
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.error, "Token no proporcionado");
    assert.strictEqual(nextCalled, false);
  });

  it("debe rechazar con 401 si el header no inicia con 'Bearer '", async () => {
    const req = { headers: { authorization: "Basic 12345" } };
    let statusSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return { json: () => {} };
      },
    };
    let nextCalled = false;

    await authMiddleware(req, res, () => {
      nextCalled = true;
    });
    assert.strictEqual(statusSent, 401);
    assert.strictEqual(nextCalled, false);
  });

  it("debe permitir el acceso si Supabase valida exitosamente el token", async () => {
    shouldThrowNetworkError = false;
    getUserResult = {
      data: { user: { id: "std-99", email: "auth@epn.edu.ec" } },
      error: null,
    };

    const req = { headers: { authorization: "Bearer valid-token-123" } };
    const res = {};
    let nextCalled = false;

    await authMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.student.id, "std-99");
  });

  it("debe usar fallback resiliente si Supabase está offline y el JWT local es válido", async () => {
    shouldThrowNetworkError = true;
    const futureExp = Math.floor(Date.now() / 1000) + 3600; // expira en 1 hora
    const validToken = createTestJwt({
      sub: "std-resilient-1",
      email: "resilient@epn.edu.ec",
      exp: futureExp,
    });

    const req = { headers: { authorization: `Bearer ${validToken}` } };
    const res = {};
    let nextCalled = false;

    await authMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
    assert.strictEqual(req.student.id, "std-resilient-1");
  });

  it("debe rechazar con 401 en fallback si el JWT expiró", async () => {
    shouldThrowNetworkError = true;
    const pastExp = Math.floor(Date.now() / 1000) - 3600; // expiró hace 1 hora
    const expiredToken = createTestJwt({
      sub: "std-expired",
      email: "expired@epn.edu.ec",
      exp: pastExp,
    });

    const req = { headers: { authorization: `Bearer ${expiredToken}` } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (body) => {
            jsonSent = body;
          },
        };
      },
    };
    let nextCalled = false;

    await authMiddleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(statusSent, 401);
    assert.strictEqual(jsonSent.error, "Token inválido o expirado");
    assert.strictEqual(nextCalled, false);
  });
});
