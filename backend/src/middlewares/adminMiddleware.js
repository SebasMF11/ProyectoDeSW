/**
 * ARCHIVO: adminMiddleware.js
 * PROPÓSITO: Middleware de autorización para restringir acciones administrativas
 *
 * RESPONSABILIDADES:
 * - Validar que el usuario autenticado (req.student) tenga rol administrativo
 * - Proteger las operaciones de mutación del catálogo universitario (POST, PUT, DELETE)
 * - Rechazar con 403 Forbidden a usuarios estudiantes no autorizados
 */

const adminMiddleware = (req, res, next) => {
  const student = req.student;

  if (!student) {
    return res.status(401).json({ error: "No autorizado: sesión no encontrada" });
  }

  // Verificar si el rol de administrador está en user_metadata, app_metadata o directo en el objeto
  const role =
    student.user_metadata?.role ||
    student.app_metadata?.role ||
    student.role;

  const isAdmin =
    role === "admin" ||
    student.user_metadata?.is_admin === true ||
    student.app_metadata?.is_admin === true;

  if (!isAdmin) {
    return res.status(403).json({
      error: "Acceso denegado: se requieren permisos de administrador para modificar el catálogo universitario",
    });
  }

  next();
};

module.exports = adminMiddleware;
