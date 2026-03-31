const express = require("express");
const router = express.Router();
const dayController = require("../controllers/DayController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, dayController.createDay);
router.get("/view/:courseId", authMiddleware, dayController.getDays);
router.put("/update/:dayId", authMiddleware, dayController.updateDay);
router.delete("/delete/:dayId", authMiddleware, dayController.deleteDay);

module.exports = router;
