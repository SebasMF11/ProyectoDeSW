const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/AssessmentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, assessmentController.createAssessment);
router.get("/view", authMiddleware, assessmentController.getAssessments);
router.get(
  "/view/course/:courseId",
  authMiddleware,
  assessmentController.getAssessmentsByCourse,
);
router.get(
  "/view/semester/:semesterId",
  authMiddleware,
  assessmentController.getAssessmentsBySemester,
);
router.put(
  "/update/:assessmentId",
  authMiddleware,
  assessmentController.updateAssessment,
);
router.delete(
  "/delete/:assessmentId",
  authMiddleware,
  assessmentController.deleteAssessment,
);

module.exports = router;
