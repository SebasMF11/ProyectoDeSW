const express = require("express");
const router = express.Router();
const dayController = require("../controllers/DayController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/create", authMiddleware, dayController.createDay);
router.get("/view/:course_id", authMiddleware, dayController.getDays);
router.put("/update/:idday", authMiddleware, dayController.updateDay);
router.delete("/delete/:idday", authMiddleware, dayController.deleteDay);

module.exports = router;
