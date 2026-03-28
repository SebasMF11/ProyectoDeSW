const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/AssessmentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, assessmentController.createAssessment);
router.get("/view", authMiddleware, assessmentController.getAssessments);
router.get(
  "/view/course/:course_id",
  authMiddleware,
  assessmentController.getAssessmentsByCourse,
);
router.get(
  "/view/semester/:semester_id",
  authMiddleware,
  assessmentController.getAssessmentsBySemester,
);
router.put(
  "/update/:idassessment",
  authMiddleware,
  assessmentController.updateAssessment,
);
router.delete(
  "/delete/:idassessment",
  authMiddleware,
  assessmentController.deleteAssessment,
);

module.exports = router;
