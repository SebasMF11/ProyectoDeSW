const express = require("express");
const router = express.Router();
const gradeController = require("../controllers/GradeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, gradeController.createGrade);
router.get(
  "/view/course/:course_id",
  authMiddleware,
  gradeController.getGradesByCourse,
);
router.put("/update/:idgrade", authMiddleware, gradeController.updateGrade);
router.delete("/delete/:idgrade", authMiddleware, gradeController.deleteGrade);

module.exports = router;
