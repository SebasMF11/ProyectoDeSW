const express = require('express');
const router = express.Router();

const semesterController = require('../controllers/SemesterController');

router.get('/view', semesterController.getSemester);
router.post("/create", semesterController.createSemester);

module.exports = router;
