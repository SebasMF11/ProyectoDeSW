const express = require("express");
const router = express.Router();
const semesterController = require("../controllers/SemesterController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/view", authMiddleware, semesterController.getSemester);
router.post("/create", authMiddleware, semesterController.createSemester);
router.put(
  "/update/:semesterId",
  authMiddleware,
  semesterController.updateSemester,
);

module.exports = router;
