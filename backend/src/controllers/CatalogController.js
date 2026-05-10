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
