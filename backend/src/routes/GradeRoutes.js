const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/GradeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, gradeController.createGrade);
router.get(
  "/view/course/:courseId",
  authMiddleware,
  gradeController.getGradesByCourse,
);
router.put("/update/:gradeId", authMiddleware, gradeController.updateGrade);
router.delete("/delete/:gradeId", authMiddleware, gradeController.deleteGrade);

module.exports = router;
