const express = require("express");
const router = express.Router();
const courseController = require("../controllers/CourseController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, courseController.createCourse);
router.get("/view", authMiddleware, courseController.getCourses);
router.get("/view/:semestername", authMiddleware, courseController.getCoursesBySemester);
router.delete("/delete/:idcourse", authMiddleware, courseController.deleteCourse);
router.put("/update/:idcourse", authMiddleware, courseController.updateCourse);

module.exports = router;
