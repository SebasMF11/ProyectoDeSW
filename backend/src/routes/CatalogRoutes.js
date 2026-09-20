const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/CatalogController");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Catálogo de carreras (público — se usa en el registro sin token)
router.get("/careers", catalogController.getCareers);

// Catálogo de facultades
router.get("/faculties", authMiddleware, catalogController.getFaculties);

// Catálogo de materias
router.get("/courses", authMiddleware, catalogController.getCoursesCatalog);
router.get(
  "/courses/available",
  authMiddleware,
  catalogController.getAvailableCourses,
);
router.get(
  "/courses/faculty/:facultyId",
  authMiddleware,
  catalogController.getCoursesCatalogByFaculty,
);
router.get(
  "/courses/career/:careerId",
  authMiddleware,
  catalogController.getCoursesCatalogByCareer,
);

// Mutaciones administrativas del catálogo (protegidas con adminMiddleware)
router.post(
  "/courses",
  authMiddleware,
  adminMiddleware,
  catalogController.createCourseCatalog,
);
router.put(
  "/courses/:id",
  authMiddleware,
  adminMiddleware,
  catalogController.updateCourseCatalog,
);
router.delete(
  "/courses/:id",
  authMiddleware,
  adminMiddleware,
  catalogController.deleteCourseCatalog,
);

module.exports = router;
