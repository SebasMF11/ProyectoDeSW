const express = require("express");
const router = express.Router();
const catalogController = require("../controllers/CatalogController");
const authMiddleware = require("../middlewares/authMiddleware");

// Catálogo de carreras (público — se usa en el registro sin token)
router.get("/careers", catalogController.getCareers);

// Catálogo de facultades
router.get("/faculties", authMiddleware, catalogController.getFaculties);

// Catálogo de materias
router.get("/courses", authMiddleware, catalogController.getCoursesCatalog);
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

module.exports = router;
