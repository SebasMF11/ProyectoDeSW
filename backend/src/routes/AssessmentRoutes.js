const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/AssessmentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, assessmentController.createAssessment);

module.exports = router;
