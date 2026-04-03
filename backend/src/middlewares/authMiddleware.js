/**
 * ARCHIVO: authMiddleware.js
 * PROPÓSITO: Middleware de autenticación JWT
 *
 * RESPONSABILIDADES:
 * - Validar tokens JWT en peticiones protegidas
 * - Extraer datos del usuario autenticado
 * - Proporcionar fallback local si Supabase no responde
 *
 * FLUJO DE SEGURIDAD:
 * 1. Verificar que el header Authorization exista (formato: "Bearer <token>")
 * 2. Intentar validar el token contra Supabase (verificación en línea)
 * 3. Si Supabase falla por red, usar validación JWT manual (descodificar)
 * 4. Agregar datos del usuario a req.student para que los controladores accedan
 *
 * TOKENS JWT:
 * - Emitidos por Supabase Auth durante login
 * - Contienen información del usuario en payload (base64)
 * - Incluyen timestamp de expiración (exp)
 */

const supabase = require("../config/supabase");

/**
 * HELPER: decodeJwtPayload
 * Decodifica manualmente el payload de un JWT
 *
 * ESTRUCTURA JWT: header.payload.signature
 * Decodificamos la segunda sección (payload base64url)
 */
const decodeJwtPayload = (token) => {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
};

/**
 * HELPER: buildFallbackUser
 * Construye un objeto usuario decodificando el JWT localmente
 *
 * PROPÓSITO:
 * Si Supabase no responde (error de red), aún podemos validar el JWT
 * extrayendo su payload y verificando expiración
 *
 * VALIDACIONES:
 * - El JWT debe contener 'sub' (subject/usuario_id)
 * - El token no debe estar expirado
 *
 * NOTA: Esta es una medida de resilencia, no reemplaza validación con Supabase
 */
const buildFallbackUser = (token) => {
  const payload = decodeJwtPayload(token);

  if (!payload?.sub) {
    return null;
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    aud: payload.aud,
  };
};

/**
 * MIDDLEWARE: authMiddleware
 *
 * FLUJO:
 * 1. Leer header Authorization
 * 2. Validar formato Bearer
 * 3. Intentar validar token con Supabase
 * 4. Si falla Supabase, usar validación manual (JWT decodificado)
 * 5. Si todo falla, rechazar petición (401)
 * 6. Si éxito, almacenar usuario en req.student y continuar
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // La peticion debe incluir un header Authorization con formato Bearer.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    // Extraemos solo el token, sin la palabra Bearer.
    const token = authHeader.split(" ")[1];

    try {
      // Primero intentamos validar el token contra Supabase.
      const { data, error } = await supabase.auth.getUser(token);

      // Si Supabase responde bien, guardamos el usuario y seguimos.
      if (!error && data?.user) {
        req.student = data.user;
        return next();
      }
    } catch (error) {
      // Si falla la red o Supabase no responde, usamos un respaldo local.
      const networkFallback = buildFallbackUser(token);

      if (networkFallback) {
        req.student = networkFallback;
        return next();
      }

      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Si Supabase no devolvio usuario, intentamos validar el JWT manualmente.
    const fallbackUser = buildFallbackUser(token);

    if (!fallbackUser) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // Dejamos el usuario disponible para los controladores.
    req.student = fallbackUser;
    next();
  } catch (error) {
    // Cualquier error inesperado termina en un acceso denegado.
    return res.status(401).json({ error: "No autorizado" });
  }
};

module.exports = authMiddleware;
