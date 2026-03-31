const supabase = require("../config/supabase");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Header recibido:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  console.log("Token extraído:", token);

  const { data, error } = await supabase.auth.getUser(token);

  console.log("Respuesta Supabase:", { data, error });

  if (error || !data?.user) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }

  req.student = data.user; // { id, email, user_metadata, ... }
  next();
};

module.exports = authMiddleware;
