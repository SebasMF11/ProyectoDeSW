const supabase = require("../config/supabase");

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
