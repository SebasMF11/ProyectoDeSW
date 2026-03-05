const express = require('express');
const router = express.Router();

const semesterController = require('../controllers/SemesterController');

router.get('/', semesterController.getSemesters);

module.exports = router;
