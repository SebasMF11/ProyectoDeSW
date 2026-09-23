const catalogService = require("../services/CatalogService");

/**
 * GET /catalog/courses/available
 * Retorna las materias disponibles para el estudiante autenticado.
 * Filtra por carrera del estudiante, excluye las ya activas/completadas,
 * e incluye info de prerequisito.
 * Query param opcional: ?facultyId=<uuid>
 */
exports.getAvailableCourses = async (req, res) => {
  try {
    const student_id = req.student.id;
    const { facultyId } = req.query;

    const courses = await catalogService.getAvailableCoursesForStudent(
      student_id,
      facultyId || null
    );
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

exports.getCareers = async (req, res) => {
  try {
    const careers = await catalogService.getAllCareers();
    res.status(200).json({ careers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getFaculties = async (req, res) => {
  try {
    const faculties = await catalogService.getAllFaculties();
    res.status(200).json({ faculties });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalog = async (req, res) => {
  try {
    const courses = await catalogService.getAllCourses();
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalogByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const courses = await catalogService.getCoursesByFaculty(facultyId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getCoursesCatalogByCareer = async (req, res) => {
  try {
    const { careerId } = req.params;
    const courses = await catalogService.getCoursesByCareer(careerId);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createCourseCatalog = async (req, res) => {
  try {
    const { name, faculty_id, prerequisito } = req.body;

    if (!name || !faculty_id) {
      return res.status(400).json({
        error: "Los campos 'name' y 'faculty_id' son obligatorios",
      });
    }

    const newCourse = await catalogService.createCourseCatalog({
      name,
      faculty_id,
      prerequisito: prerequisito || null,
    });

    res.status(201).json({
      message: "Materia agregada exitosamente al catálogo universitario",
      course: newCourse,
    });
  } catch (error) {
    console.error("Error en createCourseCatalog:", error);
    res.status(500).json({ error: error.message || "Error interno al crear materia" });
  }
};

exports.updateCourseCatalog = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, faculty_id, prerequisito } = req.body;

    if (!id) {
      return res.status(400).json({ error: "El ID de la materia es requerido" });
    }

    const updated = await catalogService.updateCourseCatalog(id, {
      name,
      faculty_id,
      prerequisito,
    });

    res.status(200).json({
      message: "Materia actualizada exitosamente en el catálogo",
      course: updated,
    });
  } catch (error) {
    console.error("Error en updateCourseCatalog:", error);
    res.status(500).json({ error: error.message || "Error interno al actualizar materia" });
  }
};

exports.deleteCourseCatalog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "El ID de la materia es requerido" });
    }

    const result = await catalogService.deleteCourseCatalog(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en deleteCourseCatalog:", error);
    res.status(400).json({ error: error.message || "Error al eliminar la materia del catálogo" });
  }
};
