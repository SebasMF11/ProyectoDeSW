const express = require("express");
const router = express.Router();

const studentController = require("../controllers/StudentController");

router.post("/auth", studentController.authStudent);
router.post("/register", studentController.createStudent);
module.exports = router;
