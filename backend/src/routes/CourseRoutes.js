const express = require("express");
const router = express.Router();
const courseController = require("../controllers/CourseController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, courseController.createCourse);
router.get("/view", authMiddleware, courseController.getCourses);
router.get(
  "/view/:semesterName",
  authMiddleware,
  courseController.getCoursesBySemester,
);
router.delete(
  "/delete/:courseId",
  authMiddleware,
  courseController.deleteCourse,
);
router.put("/update/:courseId", authMiddleware, courseController.updateCourse);
router.put(
  "/status/:courseId",
  authMiddleware,
  courseController.updateCourseStatus,
);

module.exports = router;
