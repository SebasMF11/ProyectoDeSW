const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const studentController = require("../controllers/StudentController");

router.post("/auth", studentController.authStudent);
router.post("/login", studentController.loginStudent);
router.get("/view", authMiddleware, studentController.getStudent);
router.get("/me", authMiddleware, (req, res) => {
  res.json({ student: req.student });
});

module.exports = router;
